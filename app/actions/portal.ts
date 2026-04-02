'use server';

import { createClient } from '@/utils/supabase/server';

export type ClientProfile = {
  exam_board: string | null;
  current_working_grade: string | null;
  target_grade: string | null;
};

export type ClientOverview = {
  upcomingSessions: Array<{
    id: string;
    subject: string | null;
    start_time: string;
    end_time: string;
  }>;
  unpaidInvoiceCount: number;
  unpaidInvoicePaymentLink: string | null;
  pendingAssignmentCount: number;
  monthlyCompletedLessonCount: number;
  monthlySubmittedHomeworkCount: number;
  monthlyProgressLabel: string;
};

export type ClientPortalIdentity = {
  email: string | null;
  linkedProfileCount: number;
  studentNames: string[];
};

export type ClientAssignment = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: 'pending' | 'submitted' | 'marked';
  resource_url: string;
};

export type ClientInvoice = {
  id: string;
  amount_pence: number;
  status: 'unpaid' | 'paid' | 'void';
  stripe_payment_link: string;
  created_at: string;
};

const ASSIGNMENT_BUCKET = 'academic_resources';

async function getLinkedClientProfiles() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      linkedProfiles: [] as Array<{ id: string; student_name: string; exam_board: string | null; current_working_grade: string | null; target_grade: string | null }>,
    };
  }

  const { data, error } = await supabase
    .from('client_profiles')
    .select('id, student_name, exam_board, current_working_grade, target_grade, updated_at')
    .eq('client_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    supabase,
    user,
    linkedProfiles:
      (data ?? []).map((row) => ({
        id: row.id,
        student_name: row.student_name,
        exam_board: row.exam_board,
        current_working_grade: row.current_working_grade,
        target_grade: row.target_grade,
      })) ?? [],
  };
}

export async function getClientPortalIdentity(): Promise<ClientPortalIdentity> {
  const { user, linkedProfiles } = await getLinkedClientProfiles();

  return {
    email: user?.email ?? null,
    linkedProfileCount: linkedProfiles.length,
    studentNames: linkedProfiles.map((profile) => profile.student_name),
  };
}

export async function getClientProfile(): Promise<ClientProfile | null> {
  const { linkedProfiles } = await getLinkedClientProfiles();

  if (linkedProfiles.length === 0) {
    return null;
  }

  const latestProfile = linkedProfiles[0];

  return {
    exam_board: latestProfile.exam_board,
    current_working_grade: latestProfile.current_working_grade,
    target_grade: latestProfile.target_grade,
  };
}

export async function getClientOverview(): Promise<ClientOverview> {
  const { supabase, user, linkedProfiles } = await getLinkedClientProfiles();

  if (!user || linkedProfiles.length === 0) {
    const label = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    return {
      upcomingSessions: [],
      unpaidInvoiceCount: 0,
      unpaidInvoicePaymentLink: null,
      pendingAssignmentCount: 0,
      monthlyCompletedLessonCount: 0,
      monthlySubmittedHomeworkCount: 0,
      monthlyProgressLabel: label,
    };
  }

  const nowIso = new Date().toISOString();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartIso = monthStart.toISOString();
  const monthlyProgressLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(monthStart);
  const linkedProfileIds = linkedProfiles.map((profile) => profile.id);

  const [
    upcomingSessionResult,
    unpaidInvoiceCountResult,
    unpaidInvoiceResult,
    pendingAssignmentsResult,
    completedLessonsResult,
    submittedHomeworkResult,
  ] =
    await Promise.all([
      supabase
        .from('sessions')
        .select('id, subject, start_time, end_time')
        .in('client_id', linkedProfileIds)
        .eq('status', 'scheduled')
        .gte('start_time', nowIso)
        .order('start_time', { ascending: true }),
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .in('client_id', linkedProfileIds)
        .eq('status', 'unpaid'),
      supabase
        .from('invoices')
        .select('stripe_payment_link')
        .in('client_id', linkedProfileIds)
        .eq('status', 'unpaid')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .in('client_id', linkedProfileIds)
        .eq('status', 'pending'),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .in('client_id', linkedProfileIds)
        .eq('status', 'completed')
        .gte('updated_at', monthStartIso),
      supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .in('client_id', linkedProfileIds)
        .in('status', ['submitted', 'marked'])
        .gte('updated_at', monthStartIso),
    ]);

  if (upcomingSessionResult.error) {
    throw new Error(upcomingSessionResult.error.message);
  }

  if (unpaidInvoiceCountResult.error) {
    throw new Error(unpaidInvoiceCountResult.error.message);
  }

  if (unpaidInvoiceResult.error) {
    throw new Error(unpaidInvoiceResult.error.message);
  }

  if (pendingAssignmentsResult.error) {
    throw new Error(pendingAssignmentsResult.error.message);
  }

  if (completedLessonsResult.error) {
    throw new Error(completedLessonsResult.error.message);
  }

  if (submittedHomeworkResult.error) {
    throw new Error(submittedHomeworkResult.error.message);
  }

  return {
    upcomingSessions: (upcomingSessionResult.data ?? []).map((session) => ({
      id: session.id,
      subject: session.subject,
      start_time: session.start_time,
      end_time: session.end_time,
    })),
    unpaidInvoiceCount: unpaidInvoiceCountResult.count ?? 0,
    unpaidInvoicePaymentLink: unpaidInvoiceResult.data?.stripe_payment_link ?? null,
    pendingAssignmentCount: pendingAssignmentsResult.count ?? 0,
    monthlyCompletedLessonCount: completedLessonsResult.count ?? 0,
    monthlySubmittedHomeworkCount: submittedHomeworkResult.count ?? 0,
    monthlyProgressLabel,
  };
}

export async function getClientAssignments(): Promise<ClientAssignment[]> {
  const { supabase, user, linkedProfiles } = await getLinkedClientProfiles();

  if (!user || linkedProfiles.length === 0) {
    return [];
  }

  const linkedProfileIds = linkedProfiles.map((profile) => profile.id);

  const { data, error } = await supabase
    .from('assignments')
    .select('id, title, description, due_date, status, resource_path, resource_url')
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

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        due_date: row.due_date,
        status: row.status,
        resource_url: downloadUrl,
      };
    })
  );

  return assignments;
}

export async function getClientInvoices(): Promise<ClientInvoice[]> {
  const { supabase, user, linkedProfiles } = await getLinkedClientProfiles();

  if (!user || linkedProfiles.length === 0) {
    return [];
  }

  const linkedProfileIds = linkedProfiles.map((profile) => profile.id);

  const { data, error } = await supabase
    .from('invoices')
    .select('id, amount_pence, status, stripe_payment_link, created_at')
    .in('client_id', linkedProfileIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    amount_pence: row.amount_pence,
    status: row.status,
    stripe_payment_link: row.stripe_payment_link,
    created_at: row.created_at,
  }));
}