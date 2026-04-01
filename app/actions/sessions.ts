'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export type TutorSession = {
  id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurring_group_id: string | null;
  student: {
    student_name: string;
    target_grade: string | null;
  } | null;
};

type CreateSessionInput = {
  client_id: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
};

export async function getTutorSessions(startDate: string, endDate: string): Promise<TutorSession[]> {
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
      'id, client_id, start_time, end_time, is_recurring, recurring_group_id, student:client_profiles(student_name, target_grade)'
    )
    .eq('tutor_id', user.id)
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
      start_time: row.start_time,
      end_time: row.end_time,
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
    .select('id')
    .eq('id', input.client_id)
    .eq('tutor_id', user.id)
    .maybeSingle();

  if (rosterError) {
    return { ok: false, error: rosterError.message };
  }

  if (!rosterStudent) {
    return { ok: false, error: 'Selected student was not found in your roster.' };
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
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      is_recurring: isRecurring,
      recurring_group_id: recurringGroupId,
    };
  });

  const { error } = await supabase.from('sessions').insert(rows);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/tutor/schedule');
  return { ok: true, created: rows.length };
}
