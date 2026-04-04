'use server';

import { createClient } from '@/utils/supabase/server';

export type TutorDashboardSession = {
  id: string;
  start_time: string;
  end_time: string;
  subject: string | null;
  student_name: string;
};

export type TutorDashboardData = {
  upcomingSessions: TutorDashboardSession[];
  unpaidInvoicesTotal: number;
  pendingAssignments: number;
  paidThisMonth: number;
  unpaidThisMonth: number;
  nextSession: TutorDashboardSession | null;
  totalStudents: number;
};

export type ExamCountdown = {
  targetDate: Date;
  days: number;
  weeks: number;
  months: number;
};

export async function getExamCountdown(referenceDate = new Date()): Promise<ExamCountdown> {
  const reference = new Date(referenceDate);
  const academicYearEnd = reference.getMonth() >= 7 ? reference.getFullYear() + 1 : reference.getFullYear();
  const targetDate = new Date(Date.UTC(academicYearEnd, 4, 15, 0, 0, 0));
  const diffMs = targetDate.getTime() - reference.getTime();
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    targetDate,
    days,
    weeks: Math.floor(days / 7),
    months: Math.floor(days / 30),
  };
}

export async function getTutorDashboardData(): Promise<TutorDashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      upcomingSessions: [],
      unpaidInvoicesTotal: 0,
      pendingAssignments: 0,
    };
  }

  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [sessionsResult, invoicesResult, assignmentsResult, studentResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, start_time, end_time, subject, student:client_profiles(student_name)')
      .eq('tutor_id', user.id)
      .eq('status', 'scheduled')
      .gte('start_time', now.toISOString())
      .lte('start_time', sevenDaysFromNow.toISOString())
      .order('start_time', { ascending: true }),
    supabase
      .from('invoices')
      .select('amount_pence, status, created_at')
      .eq('tutor_id', user.id)
      .in('status', ['paid', 'unpaid']),
    supabase
      .from('assignments')
      .select('id', { count: 'exact', head: true })
      .eq('tutor_id', user.id)
      .eq('status', 'pending'),
    supabase
      .from('client_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('tutor_id', user.id),
  ]);

  const { data: sessionsData, error: sessionsError } = sessionsResult;
  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  const { data: invoicesData, error: invoicesError } = invoicesResult;
  if (invoicesError) {
    throw new Error(invoicesError.message);
  }

  const { count: assignmentsCount, error: assignmentsError } = assignmentsResult;
  if (assignmentsError) {
    throw new Error(assignmentsError.message);
  }

  const { count: studentCount, error: studentError } = studentResult;
  if (studentError) {
    throw new Error(studentError.message);
  }

  const upcomingSessions = (sessionsData ?? []).map((row) => {
    const student = Array.isArray(row.student) ? row.student[0] : row.student;

    return {
      id: row.id,
      start_time: row.start_time,
      end_time: row.end_time,
      subject: row.subject,
      student_name: student?.student_name ?? 'Student',
    };
  });

  const unpaidInvoicesTotalPence = (invoicesData ?? []).reduce((total, invoice) => {
    if (invoice.status === 'unpaid') {
      return total + (Number(invoice.amount_pence) || 0);
    }
    return total;
  }, 0);

  let paidThisMonthPence = 0;
  let unpaidThisMonthPence = 0;

  (invoicesData ?? []).forEach((invoice) => {
    const invoiceDate = new Date(invoice.created_at);
    const isThisMonth = invoiceDate >= monthStart && invoiceDate <= monthEnd;

    if (isThisMonth) {
      if (invoice.status === 'paid') {
        paidThisMonthPence += Number(invoice.amount_pence) || 0;
      } else if (invoice.status === 'unpaid') {
        unpaidThisMonthPence += Number(invoice.amount_pence) || 0;
      }
    }
  });

  return {
    upcomingSessions,
    unpaidInvoicesTotal: unpaidInvoicesTotalPence / 100,
    pendingAssignments: assignmentsCount ?? 0,
    paidThisMonth: paidThisMonthPence / 100,
    unpaidThisMonth: unpaidThisMonthPence / 100,
    nextSession: upcomingSessions.length > 0 ? upcomingSessions[0] : null,
    totalStudents: studentCount ?? 0,
  };
}