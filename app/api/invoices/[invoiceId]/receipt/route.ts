import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPounds(amountPence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amountPence / 100);
}

function normalizeDisplayName(fullName: string | null, email: string | null, fallback: string) {
  if (fullName && fullName.trim().length > 0) {
    return fullName;
  }

  if (email && email.trim().length > 0) {
    return email;
  }

  return fallback;
}

export async function GET(request: NextRequest) {
  const pathParts = request.nextUrl.pathname.split('/').filter(Boolean);
  const invoiceId = pathParts[2];

  if (!invoiceId) {
    return NextResponse.json({ error: 'Invoice id is required.' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, tutor_id, client_id, description, amount_pence, status, created_at, paid_at')
    .eq('id', invoiceId)
    .maybeSingle();

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 400 });
  }

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
  }

  if (invoice.status !== 'paid' || !invoice.paid_at) {
    return NextResponse.json({ error: 'Receipt is available only for paid invoices.' }, { status: 400 });
  }

  const { data: clientProfile, error: clientProfileError } = await supabase
    .from('client_profiles')
    .select('client_id')
    .eq('id', invoice.client_id)
    .maybeSingle();

  if (clientProfileError) {
    return NextResponse.json({ error: clientProfileError.message }, { status: 400 });
  }

  if (!clientProfile) {
    return NextResponse.json({ error: 'Client profile not found.' }, { status: 404 });
  }

  const { data: payerProfile, error: payerError } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', clientProfile.client_id)
    .maybeSingle();

  if (payerError) {
    return NextResponse.json({ error: payerError.message }, { status: 400 });
  }

  const { data: payeeProfile, error: payeeError } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', invoice.tutor_id)
    .maybeSingle();

  if (payeeError) {
    return NextResponse.json({ error: payeeError.message }, { status: 400 });
  }

  const payer = normalizeDisplayName(
    payerProfile?.full_name ?? null,
    payerProfile?.email ?? null,
    'Client'
  );
  const payee = normalizeDisplayName(
    payeeProfile?.full_name ?? null,
    payeeProfile?.email ?? null,
    'Tutor'
  );

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const left = 56;
  let y = 790;

  page.drawText('Payment Receipt', {
    x: left,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.18, 0.35),
  });

  y -= 30;
  page.drawText(`Receipt ID: ${invoice.id}`, {
    x: left,
    y,
    size: 10,
    font: regularFont,
    color: rgb(0.35, 0.35, 0.35),
  });

  y -= 36;
  page.drawText(`Invoice Title: ${invoice.description}`, {
    x: left,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  y -= 24;
  page.drawText(`Payer: ${payer}`, {
    x: left,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  y -= 22;
  page.drawText(`Payee: ${payee}`, {
    x: left,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  y -= 22;
  page.drawText(`Invoice Creation Date: ${formatDateTime(invoice.created_at)}`, {
    x: left,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  y -= 22;
  page.drawText(`Invoice Paid Date: ${formatDateTime(invoice.paid_at)}`, {
    x: left,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  y -= 22;
  page.drawText(`Amount Paid: ${formatPounds(invoice.amount_pence)}`, {
    x: left,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  const pdfBytes = await pdfDoc.save();
  const safeId = invoice.id.replace(/[^a-zA-Z0-9-_]/g, '');

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${safeId}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
