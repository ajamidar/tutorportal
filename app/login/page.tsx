import LoginForm from './login-form';

type LoginPageProps = {
  searchParams: Promise<{ error?: string; mode?: string; sent?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <LoginForm
      error={params.error}
      initialMode={params.mode === 'signup' ? 'signup' : params.mode === 'reset' ? 'reset' : 'signin'}
      resetSent={params.sent === '1'}
    />
  );
}
