'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export type TutorSession = {
  id: string;
  client_id: string;
  subject: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  cancelled_at: string | null;
  is_recurring: boolean;
  recurring_group_id: string | null;
  student: {
    student_name: string;
    target_grade: string | null;
  } | null;
};

type SessionStatusFilter = 'scheduled' | 'cancelled' | 'completed';

type CreateSessionInput = {
  client_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
};

type RescheduleSessionInput = {
  session_id: string;
  start_time: string;
  end_time: string;
};

type ActionResult = {
  ok: boolean;
  error?: string;
};

function toSessionWriteError(error: { message: string; code?: string } | null): string {
  if (!error) {
    return 'Something went wrong while saving this lesson.';
  }

  if (error.code === '23P01' || error.message.includes('sessions_tutor_no_overlap')) {
    return 'This session clashes with an existing scheduled lesson. Please choose a different time.';
  }

  return error.message;
}

async function hasTutorSessionClash(
  tutorId: string,
  startIso: string,
  endIso: string,
  excludeSessionId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from('sessions')
    .select('id')
    .eq('tutor_id', tutorId)
    .eq('status', 'scheduled')
    .lt('start_time', endIso)
    .gt('end_time', startIso)
    .limit(1);

  if (excludeSessionId) {
    query = query.neq('id', excludeSessionId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).length > 0;
}

export async function getTutorSessions(
  startDate: string,
  endDate: string,
  status: SessionStatusFilter = 'scheduled'
): Promise<TutorSession[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('sessions')
    .select(
      'id, client_id, subject, start_time, end_time, status, cancelled_at, is_recurring, recurring_group_id, student:client_profiles(student_name, target_grade)'
    )
    .eq('tutor_id', user.id)
    .eq('status', status)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const student = Array.isArray(row.student) ? row.student[0] : row.student;

    return {
      id: row.id,
      client_id: row.client_id,
      subject: row.subject,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      cancelled_at: row.cancelled_at,
      is_recurring: row.is_recurring,
      recurring_group_id: row.recurring_group_id,
      student: student
        ? {
            student_name: student.student_name,
            target_grade: student.target_grade,
          }
        : null,
    };
  });
}

export async function createSession(input: CreateSessionInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const start = new Date(input.start_time);
  const end = new Date(input.end_time);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, error: 'Invalid session time.' };
  }

  if (end <= start) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  const { data: rosterStudent, error: rosterError } = await supabase
    .from('client_profiles')
    .select('id, subject')
    .eq('id', input.client_id)
    .eq('tutor_id', user.id)
    .maybeSingle();

  if (rosterError) {
    return { ok: false, error: rosterError.message };
  }

  if (!rosterStudent) {
    return { ok: false, error: 'Selected student was not found in your roster.' };
  }

  const selectedSubject = input.subject.trim();

  if (!selectedSubject) {
    return { ok: false, error: 'Please select a subject for the session.' };
  }

  const matchesRosterSubject = await supabase
    .from('client_profiles')
    .select('id')
    .eq('id', input.client_id)
    .eq('tutor_id', user.id)
    .eq('subject', selectedSubject)
    .maybeSingle();

  if (!matchesRosterSubject.data) {
    return { ok: false, error: 'Selected subject does not match the student roster entry.' };
  }

  const isRecurring = Boolean(input.is_recurring);
  const recurringGroupId = isRecurring ? randomUUID() : null;

  const rows = Array.from({ length: isRecurring ? 13 : 1 }, (_, index) => {
    const offsetDays = index * 7;
    const startTime = new Date(start);
    const endTime = new Date(end);

    startTime.setDate(startTime.getDate() + offsetDays);
    endTime.setDate(endTime.getDate() + offsetDays);

    return {
      tutor_id: user.id,
      client_id: input.client_id,
      subject: selectedSubject,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      is_recurring: isRecurring,
      recurring_group_id: recurringGroupId,
    };
  });

  for (const row of rows) {
    const hasClash = await hasTutorSessionClash(user.id, row.start_time, row.end_time);
    if (hasClash) {
      return {
        ok: false,
        error: 'This session clashes with an existing scheduled lesson. Please choose a different time.',
      };
    }
  }

  const { error } = await supabase.from('sessions').insert(rows);

  if (error) {
    return { ok: false, error: toSessionWriteError(error) };
  }

  revalidatePath('/tutor/schedule');
  return { ok: true, created: rows.length };
}

export async function rescheduleSession(input: RescheduleSessionInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const start = new Date(input.start_time);
  const end = new Date(input.end_time);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, error: 'Invalid session time.' };
  }

  if (end <= start) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  const { data: existingSession, error: existingSessionError } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', input.session_id)
    .eq('tutor_id', user.id)
    .eq('status', 'scheduled')
    .maybeSingle();

  if (existingSessionError) {
    return { ok: false, error: existingSessionError.message };
  }

  if (!existingSession) {
    return { ok: false, error: 'Session not found or is no longer editable.' };
  }

  const hasClash = await hasTutorSessionClash(
    user.id,
    start.toISOString(),
    end.toISOString(),
    input.session_id
  );

  if (hasClash) {
    return {
      ok: false,
      error: 'This time clashes with another scheduled lesson. Please choose a different slot.',
    };
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      cancelled_at: null,
    })
    .eq('id', input.session_id)
    .eq('tutor_id', user.id)
    .eq('status', 'scheduled');

  if (error) {
    return { ok: false, error: toSessionWriteError(error) };
  }

  revalidatePath('/tutor/schedule');
  revalidatePath('/tutor/dashboard');
  revalidatePath('/portal/dashboard');
  return { ok: true };
}

export async function cancelSession(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('tutor_id', user.id)
    .eq('status', 'scheduled')
    .maybeSingle();

  if (sessionError) {
    return { ok: false, error: sessionError.message };
  }

  if (!session) {
    return { ok: false, error: 'Session not found or already cancelled.' };
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('tutor_id', user.id)
    .eq('status', 'scheduled');

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/tutor/schedule');
  revalidatePath('/tutor/dashboard');
  revalidatePath('/portal/dashboard');
  return { ok: true };
}
