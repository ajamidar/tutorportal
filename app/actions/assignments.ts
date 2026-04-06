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
    .select(
      'id, title, description, due_date, status, resource_path, resource_url, student:client_profiles(student_name), assignment_submissions(submission_status)'
    )
    .eq('tutor_id', user.id)
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  const assignments = await Promise.all(
    rows.map(async (row) => {
      const student = Array.isArray(row.student) ? row.student[0] : row.student;
      const submissionRows = Array.isArray(row.assignment_submissions) ? row.assignment_submissions : [];
      const effectiveStatus = submissionRows[0]?.submission_status ?? row.status;
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
        status: effectiveStatus,
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

// ============ SUBMISSION MANAGEMENT ============

const SUBMISSION_BUCKET = 'student_submissions';
const SUBMISSION_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'] as const;

export type ClientAssignmentWithSubmission = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: 'pending' | 'submitted' | 'marked';
  resource_url: string;
  submission: {
    id: string;
    submitted_date: string | null;
    submission_status: 'pending' | 'submitted' | 'marked';
    marks: number | null;
    feedback_text: string | null;
    feedback_pdf_url: string | null;
    marked_date: string | null;
  } | null;
};

export async function getClientAssignmentsWithSubmissions(): Promise<ClientAssignmentWithSubmission[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get all linked client profiles for this user
  const { data: linkedProfiles, error: profilesError } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('client_id', user.id);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  if (!linkedProfiles || linkedProfiles.length === 0) {
    return [];
  }

  const linkedProfileIds = linkedProfiles.map((p) => p.id);

  const { data, error } = await supabase
    .from('assignments')
    .select(
      `
      id, 
      title, 
      description, 
      due_date, 
      status, 
      resource_path, 
      resource_url,
      assignment_submissions(
        id,
        submitted_date,
        submission_status,
        marks,
        feedback_text,
        feedback_pdf_path,
        marked_date
      )
    `
    )
    .in('client_id', linkedProfileIds)
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  const assignments = await Promise.all(
    rows.map(async (row) => {
      let downloadUrl = row.resource_url;

      if (typeof row.resource_path === 'string' && row.resource_path.length > 0) {
        const { data: signedData } = await supabase.storage
          .from(ASSIGNMENT_BUCKET)
          .createSignedUrl(row.resource_path, 60 * 60);

        if (signedData?.signedUrl) {
          downloadUrl = signedData.signedUrl;
        }
      }

      const submissions = Array.isArray(row.assignment_submissions)
        ? row.assignment_submissions
        : row.assignment_submissions
          ? [row.assignment_submissions]
          : [];
      const submission = submissions[0] || null;
      const effectiveStatus = submission?.submission_status ?? row.status;

      let feedbackPdfUrl: string | null = null;
      if (submission?.feedback_pdf_path) {
        const { data: feedbackSignedData } = await supabase.storage
          .from(SUBMISSION_BUCKET)
          .createSignedUrl(submission.feedback_pdf_path, 60 * 60);

        if (feedbackSignedData?.signedUrl) {
          feedbackPdfUrl = feedbackSignedData.signedUrl;
        }
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        due_date: row.due_date,
        status: effectiveStatus,
        resource_url: downloadUrl,
        submission: submission
          ? {
              id: submission.id,
              submitted_date: submission.submitted_date,
              submission_status: submission.submission_status,
              marks: submission.marks,
              feedback_text: submission.feedback_text,
              feedback_pdf_url: feedbackPdfUrl,
              marked_date: submission.marked_date,
            }
          : null,
      };
    })
  );

  return assignments;
}

export async function submitAssignment(assignmentId: string, file: File) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  if (file.size <= 0) {
    return { ok: false, error: 'The selected file is empty.' };
  }

  const extension = extractExtension(file.name);
  if (!SUBMISSION_ALLOWED_EXTENSIONS.includes(extension as (typeof SUBMISSION_ALLOWED_EXTENSIONS)[number])) {
    return { ok: false, error: 'Invalid file type. Please upload PDF, DOC, DOCX, PNG, or JPG.' };
  }

  // Get the assignment and verify it belongs to a client profile owned by this user
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('id, client_id')
    .eq('id', assignmentId)
    .maybeSingle();

  if (assignmentError) {
    return { ok: false, error: assignmentError.message };
  }

  if (!assignment) {
    return { ok: false, error: 'Assignment not found.' };
  }

  // Verify this user owns the client_profile for this assignment
  const { data: clientProfile, error: cpError } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('id', assignment.client_id)
    .eq('client_id', user.id)
    .maybeSingle();

  if (cpError) {
    return { ok: false, error: cpError.message };
  }

  if (!clientProfile) {
    return { ok: false, error: 'You are not authorized to submit this assignment.' };
  }

  // Check if submission already exists
  const { data: existingSubmission, error: submissionCheckError } = await supabase
    .from('assignment_submissions')
    .select('id, submitted_file_path')
    .eq('assignment_id', assignmentId)
    .eq('client_profile_id', assignment.client_id)
    .maybeSingle();

  if (submissionCheckError && submissionCheckError.code !== 'PGRST116') {
    return { ok: false, error: submissionCheckError.message };
  }

  const filePath = `${user.id}/${assignmentId}/${Date.now()}_${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(SUBMISSION_BUCKET)
    .upload(filePath, file, { upsert: false, contentType: file.type || undefined });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  if (existingSubmission) {
    // Update existing submission
    const { error: updateError } = await supabase
      .from('assignment_submissions')
      .update({
        submitted_file_path: filePath,
        submitted_date: new Date().toISOString(),
        submission_status: 'submitted',
      })
      .eq('id', existingSubmission.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }
  } else {
    // Create new submission record
    const { error: insertError } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        client_profile_id: assignment.client_id,
        submitted_file_path: filePath,
        submitted_date: new Date().toISOString(),
        submission_status: 'submitted',
      });

    if (insertError) {
      return { ok: false, error: insertError.message };
    }
  }

  const { error: assignmentStatusError } = await supabase
    .from('assignments')
    .update({ status: 'submitted' })
    .eq('id', assignmentId);

  if (assignmentStatusError) {
    return { ok: false, error: assignmentStatusError.message };
  }

  revalidatePath('/portal/assignments');
  revalidatePath('/tutor/assignments');
  return { ok: true };
}

// Types for tutor submissions view
export type TutorAssignmentWithSubmissions = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  resource_url: string;
  submissions: Array<{
    id: string;
    student_name: string;
    submitted_date: string | null;
    submission_status: 'pending' | 'submitted' | 'marked';
    marks: number | null;
    submitted_file_url: string | null;
  }>;
};

export async function getTutorAssignmentWithSubmissions(
  assignmentId: string
): Promise<TutorAssignmentWithSubmissions | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(
      `
      id,
      title,
      description,
      due_date,
      resource_path,
      resource_url,
      assignment_submissions(
        id,
        client_profile_id,
        submitted_date,
        submission_status,
        marks,
        submitted_file_path,
        client_profiles!assignment_submissions_client_profile_id_fkey(student_name)
      )
    `
    )
    .eq('id', assignmentId)
    .eq('tutor_id', user.id)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  if (!assignment) {
    return null;
  }

  const submissions = Array.isArray(assignment.assignment_submissions)
    ? assignment.assignment_submissions
    : assignment.assignment_submissions
      ? [assignment.assignment_submissions]
      : [];

  const submissionsWithUrls = await Promise.all(
    submissions.map(async (sub) => {
      let submittedFileUrl: string | null = null;

      if (sub.submitted_file_path) {
        const { data: signedData } = await supabase.storage
          .from(SUBMISSION_BUCKET)
          .createSignedUrl(sub.submitted_file_path, 60 * 60);

        if (signedData?.signedUrl) {
          submittedFileUrl = signedData.signedUrl;
        }
      }

      const clientProfileData = Array.isArray(sub.client_profiles) ? sub.client_profiles[0] : sub.client_profiles;

      return {
        id: sub.id,
        student_name: clientProfileData?.student_name ?? 'Unknown',
        submitted_date: sub.submitted_date,
        submission_status: sub.submission_status,
        marks: sub.marks,
        submitted_file_url: submittedFileUrl,
      };
    })
  );

  let downloadUrl = assignment.resource_url;
  if (typeof assignment.resource_path === 'string' && assignment.resource_path.length > 0) {
    const { data: signedData } = await supabase.storage
      .from(ASSIGNMENT_BUCKET)
      .createSignedUrl(assignment.resource_path, 60 * 60);

    if (signedData?.signedUrl) {
      downloadUrl = signedData.signedUrl;
    }
  }

  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    due_date: assignment.due_date,
    resource_url: downloadUrl,
    submissions: submissionsWithUrls,
  };
}

export async function markAssignment(
  submissionId: string,
  marks: number | null,
  feedbackText: string | null,
  feedbackFile: File | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  // Verify the submission exists and belongs to a tutor's assignment
  const { data: submission, error: submissionError } = await supabase
    .from('assignment_submissions')
    .select('id, assignment_id')
    .eq('id', submissionId)
    .maybeSingle();

  if (submissionError) {
    return { ok: false, error: submissionError.message };
  }

  if (!submission) {
    return { ok: false, error: 'Submission not found.' };
  }

  // Verify the assignment belongs to this tutor
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('id')
    .eq('id', submission.assignment_id)
    .eq('tutor_id', user.id)
    .maybeSingle();

  if (assignmentError) {
    return { ok: false, error: assignmentError.message };
  }

  if (!assignment) {
    return { ok: false, error: 'You are not authorized to mark this submission.' };
  }

  // Validate feedback text length
  if (feedbackText && feedbackText.length > 500) {
    return { ok: false, error: 'Feedback text must not exceed 500 characters.' };
  }

  let feedbackPdfPath: string | null = null;

  // Upload feedback PDF if provided
  if (feedbackFile) {
    if (feedbackFile.size <= 0) {
      return { ok: false, error: 'The feedback PDF file is empty.' };
    }

    const extension = extractExtension(feedbackFile.name);
    if (extension !== 'pdf') {
      return { ok: false, error: 'Feedback file must be a PDF.' };
    }

    feedbackPdfPath = `feedback/${user.id}/${submissionId}/${Date.now()}_${sanitizeFileName(feedbackFile.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(SUBMISSION_BUCKET)
      .upload(feedbackPdfPath, feedbackFile, { upsert: false, contentType: 'application/pdf' });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }
  }

  // Update submission with marking
  const { error: updateError } = await supabase
    .from('assignment_submissions')
    .update({
      submission_status: 'marked',
      marked_date: new Date().toISOString(),
      marked_by_tutor_id: user.id,
      feedback_text: feedbackText || null,
      feedback_pdf_path: feedbackPdfPath || null,
      marks: marks !== null ? marks : null,
    })
    .eq('id', submissionId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const { error: assignmentStatusError } = await supabase
    .from('assignments')
    .update({ status: 'marked' })
    .eq('id', submission.assignment_id);

  if (assignmentStatusError) {
    return { ok: false, error: assignmentStatusError.message };
  }

  revalidatePath('/tutor/assignments');
  revalidatePath('/portal/assignments');
  return { ok: true };
}
