import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WorkloadItem } from "@/types/dashboard";

export function WorkloadTable({ items }: { items: WorkloadItem[] }) {
  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold text-slate-900">Team workload</CardTitle>
        <p className="text-sm text-slate-400">Balance active work, overdue items, and completed output across the team.</p>
      </CardHeader>
      <CardContent className="mt-6 space-y-3 p-0">
        {items.map((item) => (
          <div key={item.name} className="rounded-[24px] bg-background px-5 py-5">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400">{item.role}</p>
              </div>
              <Metric label="Active" value={String(item.tasks)} />
              <Metric label="Overdue" value={String(item.overdue)} />
              <Metric label="Completed" value={String(item.completed)} />
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Load</p>
                <Progress className="h-2 bg-slate-100" value={item.load} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
