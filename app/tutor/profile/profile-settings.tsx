'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteTutorAccount, updateTutorProfileDetails } from '@/app/actions/profile';
import { DangerConfirmDialog } from '@/components/ui/danger-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProfileSettingsProps = {
  initialEmail: string;
  initialFullName: string;
};

export function ProfileSettings({ initialEmail, initialFullName }: ProfileSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Profile</p>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              startTransition(async () => {
                const result = await updateTutorProfileDetails({ fullName, email });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }

                if (result.emailChanged) {
                  toast.success('Profile updated. Check your email to confirm the new address if prompted.');
                } else {
                  toast.success('Profile updated.');
                }

                router.refresh();
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="profile_full_name">Full Name</Label>
              <Input
                id="profile_full_name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_email">Email</Label>
              <Input
                id="profile_email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600">Danger Zone</p>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            This deletes your account and removes your linked Tutor Portal data permanently.
          </p>
          <DangerConfirmDialog
            triggerLabel="Delete Account"
            title="Delete Your Account"
            description="This action is permanent. Your profile and linked Tutor Portal records will be removed."
            acknowledgeLabel="I understand this permanently deletes my account and data."
            confirmLabel="Delete My Account"
            pendingLabel="Deleting..."
            onConfirm={async () => {
              const result = await deleteTutorAccount();
              if (!result.ok) {
                toast.error(result.error);
                return false;
              }

              toast.success('Account deleted.');
              window.location.href = '/login?message=Your+account+has+been+deleted';
              return true;
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
