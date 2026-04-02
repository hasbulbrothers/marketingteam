import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStat } from "@/types/dashboard";

export function StatsCard({ stat }: { stat: DashboardStat }) {
  const overdue = stat.label.toLowerCase().includes("overdue");

  return (
    <Card className="premium-card h-56 border-none">
      <CardContent className="flex h-full flex-col justify-between p-8">
        <div className="flex items-start justify-between">
          <p className={overdue ? "text-[10px] font-bold uppercase tracking-[0.22em] text-red-400" : "text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400"}>
            {stat.label}
          </p>
          <div className={overdue ? "rounded-lg bg-red-50 p-2 text-red-500" : "rounded-lg bg-slate-50 p-2 text-primary"}>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className={overdue ? "mb-2 text-5xl font-bold text-red-600" : "mb-2 text-5xl font-bold text-slate-900"}>{stat.value}</p>
          <p className="text-sm text-slate-500">{stat.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
