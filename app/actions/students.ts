'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export type TutorStudent = {
  id: string;
  client_id: string;
  student_name: string;
  subject: string;
  level: 'gcse' | 'a_level';
  exam_board: string;
  current_working_grade: string | null;
  target_grade: string | null;
  client: {
    email: string;
    full_name: string | null;
  };
};

export async function getTutorStudents(): Promise<TutorStudent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('client_profiles')
    .select(
      'id, client_id, student_name, subject, level, exam_board, current_working_grade, target_grade, client:profiles!client_profiles_client_id_fkey(email, full_name)'
    )
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const client = Array.isArray(row.client) ? row.client[0] : row.client;
    const currentWorkingGrade =
      typeof row.current_working_grade === 'string'
        ? row.current_working_grade
        : (row.current_working_grade ?? null);
    const targetGrade =
      typeof row.target_grade === 'string' ? row.target_grade : (row.target_grade ?? null);

    return {
      id: row.id,
      client_id: row.client_id,
      student_name: row.student_name,
      subject: row.subject,
      level: row.level,
      exam_board: row.exam_board,
      current_working_grade: currentWorkingGrade,
      target_grade: targetGrade,
      client: {
        email: client?.email ?? '',
        full_name: client?.full_name ?? null,
      },
    };
  });
}

type AddClientProfileInput = {
  email: string;
  studentName: string;
  level: 'gcse' | 'a_level';
  subjects: Array<{
    subject: string;
    examBoard: string;
    currentWorkingGrade: string;
    targetGrade: string;
  }>;
};

export async function addClientProfile(input: AddClientProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const studentName = input.studentName.trim();
  const level = input.level === 'a_level' ? 'a_level' : 'gcse';
  const subjects = input.subjects ?? [];

  if (!normalizedEmail || !studentName || subjects.length === 0) {
    return { ok: false, error: 'Email, student name, and at least one subject are required.' };
  }

  const { data: clientProfile, error: clientLookupError } = await supabase
    .from('profiles')
    .select('id, role')
    .ilike('email', normalizedEmail)
    .eq('role', 'client')
    .maybeSingle();

  if (clientLookupError) {
    return { ok: false, error: clientLookupError.message };
  }

  if (!clientProfile) {
    return { ok: false, error: 'User not found. They must create a client account first.' };
  }

  const rows = subjects
    .map((item) => ({
      tutor_id: user.id,
      client_id: clientProfile.id,
      student_name: studentName,
      subject: item.subject.trim(),
      level,
      exam_board: item.examBoard.trim(),
      current_working_grade: item.currentWorkingGrade.trim() || null,
      target_grade: item.targetGrade.trim() || null,
    }))
    .filter((item) => item.subject && item.exam_board);

  if (rows.length === 0) {
    return { ok: false, error: 'Each subject row needs a subject and exam board.' };
  }

  const { error: insertError } = await supabase.from('client_profiles').insert(rows);

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  revalidatePath('/tutor/students');
  return { ok: true, created: rows.length };
}

type DeleteStudentInput = {
  clientId: string;
  studentName: string;
  level: 'gcse' | 'a_level';
};

export async function deleteClientProfile({ clientId, studentName, level }: DeleteStudentInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  if (!clientId || !studentName || !level) {
    return { ok: false, error: 'Student details are required.' };
  }

  const { error } = await supabase
    .from('client_profiles')
    .delete()
    .eq('client_id', clientId)
    .eq('student_name', studentName)
    .eq('level', level)
    .eq('tutor_id', user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/tutor/students');
  return { ok: true };
}
