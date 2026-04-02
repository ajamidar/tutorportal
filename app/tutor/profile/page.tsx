import { getTutorProfileDetails } from '@/app/actions/profile';
import { ProfileSettings } from './profile-settings';

export default async function TutorProfilePage() {
  const profile = await getTutorProfileDetails();

  if (!profile) {
    return (
      <main className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-600">Unable to load profile details. Please sign in again.</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Account</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Profile</h2>
        <p className="text-sm text-slate-600">Manage your personal details and account settings.</p>
      </section>

      <ProfileSettings initialEmail={profile.email} initialFullName={profile.full_name ?? ''} />
    </main>
  );
}
