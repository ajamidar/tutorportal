import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

const ALLOWED_BUCKET = 'student_submissions';

function isAllowedPath(value: string) {
  return value.startsWith('feedback/');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path || !isAllowedPath(path)) {
    return NextResponse.json({ error: 'Invalid feedback PDF path.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(ALLOWED_BUCKET).download(path);

  if (error || !data) {
    return NextResponse.json({ error: 'Unable to load feedback PDF.' }, { status: 502 });
  }

  const headers = new Headers();
  headers.set('content-type', 'application/pdf');
  headers.set('content-disposition', 'inline; filename="feedback.pdf"');

  return new Response(data, {
    status: 200,
    headers,
  });
}