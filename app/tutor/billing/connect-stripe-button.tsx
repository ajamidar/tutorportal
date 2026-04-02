import { createStripeConnectAccount } from '@/app/actions/stripe';
import { Button } from '@/components/ui/button';

type ConnectStripeButtonProps = {
  label?: string;
};

export function ConnectStripeButton({ label = 'Connect Your Bank Via Stripe' }: ConnectStripeButtonProps) {
  return (
    <form action={createStripeConnectAccount}>
      <Button type="submit">{label}</Button>
    </form>
  );
}
