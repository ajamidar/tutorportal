import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TutorBillingPage() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Finance</p>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">Invoice and Stripe billing tools will be added next.</p>
      </CardContent>
    </Card>
  );
}
