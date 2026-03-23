import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TutorSchedulePage() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Planning</p>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">Weekly scheduling tools will be added next.</p>
      </CardContent>
    </Card>
  );
}
