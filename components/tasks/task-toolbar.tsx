import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStat } from "@/types/dashboard";

export function TaskToolbar({
  summary,
  onCreate,
  activeFilterCount,
}: {
  summary: DashboardStat[];
  onCreate: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="premium-card border-none p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {summary.map((item) => (
            <div key={item.label} className="rounded-[24px] bg-background px-5 py-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
        <Button className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/95" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New task{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
      </div>
    </div>
  );
}
