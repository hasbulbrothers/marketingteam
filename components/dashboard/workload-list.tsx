import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WorkloadItem } from "@/types/dashboard";

export function WorkloadList({ items }: { items: WorkloadItem[] }) {
  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="mb-8 p-0">
        <CardTitle className="text-xl font-bold text-slate-900">Team workload</CardTitle>
        <p className="text-sm text-slate-400">Resource distribution and health</p>
      </CardHeader>
      <CardContent className="space-y-8 p-0">
        {items.map((item) => (
          <div key={item.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400">{item.role}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-600">{item.tasks} active</p>
                <p className={item.overdue > 0 ? "text-[10px] text-red-500" : "text-[10px] text-slate-400"}>
                  {item.overdue} overdue
                </p>
              </div>
            </div>
            <Progress className="h-2 bg-slate-100" value={item.load} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
