import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStat } from "@/types/dashboard";

export type PeriodView = "month" | "week";

export function TaskToolbar({
  summary,
  onCreate,
  activeFilterCount,
  periodLabel,
  periodView,
  onPeriodChange,
  onPeriodViewChange,
}: {
  summary: DashboardStat[];
  onCreate: () => void;
  activeFilterCount: number;
  periodLabel?: string;
  periodView?: PeriodView;
  onPeriodChange?: (direction: "prev" | "next") => void;
  onPeriodViewChange?: (view: PeriodView) => void;
}) {
  return (
    <div className="premium-card border-none p-6">
      <div className="flex flex-col gap-5">
        {periodView && onPeriodChange && onPeriodViewChange && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => onPeriodViewChange("month")}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${periodView === "month" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => onPeriodViewChange("week")}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${periodView === "week" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  Week
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onPeriodChange("prev")} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[140px] text-center text-sm font-semibold text-slate-700">{periodLabel}</span>
                <button type="button" onClick={() => onPeriodChange("next")} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Button className="h-10 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/95" onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New task
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {summary.map((item) => (
              <div key={item.label} className="rounded-[24px] bg-background px-5 py-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          {!periodView && (
            <Button className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/95" onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New task{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
