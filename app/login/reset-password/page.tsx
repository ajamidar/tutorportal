import ResetPasswordForm from './reset-password-form';

type ResetPasswordPageProps = {
  searchParams: Promise<{ code?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return <ResetPasswordForm code={params.code} initialError={params.error} />;
}