'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

const ASSIGNMENT_BUCKET = 'academic_resources';
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'] as const;

export type TutorAssignment = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: 'pending' | 'submitted' | 'marked';
  resource_url: string;
  student: {
    student_name: string;
  } | null;
};

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function extractExtension(name: string) {
  const parts = name.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export async function getTutorAssignments(): Promise<TutorAssignment[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('assignments')
    .select('id, title, description, due_date, status, resource_path, resource_url, student:client_profiles(student_name)')
    .eq('tutor_id', user.id)
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  const assignments = await Promise.all(
    rows.map(async (row) => {
      const student = Array.isArray(row.student) ? row.student[0] : row.student;
      let downloadUrl = row.resource_url;

      if (typeof row.resource_path === 'string' && row.resource_path.length > 0) {
        const { data: signedData } = await supabase.storage
          .from(ASSIGNMENT_BUCKET)
          .createSignedUrl(row.resource_path, 60 * 60);

        if (signedData?.signedUrl) {
          downloadUrl = signedData.signedUrl;
        }
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        due_date: row.due_date,
        status: row.status,
        resource_url: downloadUrl,
        student: student
          ? {
              student_name: student.student_name,
            }
          : null,
      };
    })
  );

  return assignments;
}

export async function createAssignment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const clientId = String(formData.get('client_id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const dueDate = String(formData.get('due_date') ?? '').trim();
  const file = formData.get('file');

  if (!clientId || !title || !dueDate || !(file instanceof File)) {
    return { ok: false, error: 'Client, title, due date, and file are required.' };
  }

  const dueDateObj = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(dueDateObj.getTime())) {
    return { ok: false, error: 'Please provide a valid due date.' };
  }

  if (file.size <= 0) {
    return { ok: false, error: 'The selected file is empty.' };
  }

  const extension = extractExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
    return { ok: false, error: 'Invalid file type. Please upload PDF, DOC, DOCX, PNG, or JPG.' };
  }

  const { data: rosterRow, error: rosterError } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('id', clientId)
    .eq('tutor_id', user.id)
    .maybeSingle();

  if (rosterError) {
    return { ok: false, error: rosterError.message };
  }

  if (!rosterRow) {
    return { ok: false, error: 'Selected student was not found in your roster.' };
  }

  const filePath = `${user.id}/${Date.now()}_${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(ASSIGNMENT_BUCKET)
    .upload(filePath, file, { upsert: false, contentType: file.type || undefined });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(ASSIGNMENT_BUCKET)
    .createSignedUrl(filePath, 60 * 60 * 24 * 30);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return {
      ok: false,
      error: signedUrlError?.message ?? 'Assignment file uploaded but URL generation failed.',
    };
  }

  const { error: insertError } = await supabase.from('assignments').insert({
    tutor_id: user.id,
    client_id: clientId,
    title,
    description: description || null,
    due_date: dueDate,
    resource_path: filePath,
    resource_url: signedUrlData.signedUrl,
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  revalidatePath('/tutor/assignments');
  return { ok: true };
}
