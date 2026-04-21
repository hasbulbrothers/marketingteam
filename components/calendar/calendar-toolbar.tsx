import { CalendarDays, ChevronLeft, ChevronRight, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/lib/constants/platforms";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { Platform, TaskStatus } from "@/types/task";

type Filters = {
  platform: Platform | "all";
  assigneeId: string | "all";
  status: TaskStatus | "all";
  view: "month" | "week";
};

export function CalendarToolbar({
  periodLabel,
  filters,
  assignees,
  onMonthChange,
  onFilterChange,
}: {
  periodLabel: string;
  filters: Filters;
  assignees: Array<{ id: string; name: string }>;
  onMonthChange: (direction: "prev" | "next") => void;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" onClick={() => onMonthChange("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[160px] text-center text-lg font-bold tracking-tight text-slate-900 sm:min-w-[200px]">
            {periodLabel}
          </h2>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" onClick={() => onMonthChange("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => onFilterChange("view", "month")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filters.view === "month" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Month</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("view", "week")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filters.view === "week" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Week</span>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterSelect value={filters.platform} onChange={(value) => onFilterChange("platform", value as Filters["platform"])}>
          <option value="all">All platforms</option>
          {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
        </FilterSelect>
        <FilterSelect value={filters.assigneeId} onChange={(value) => onFilterChange("assigneeId", value)}>
          <option value="all">All assignees</option>
          {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}
        </FilterSelect>
        <FilterSelect value={filters.status} onChange={(value) => onFilterChange("status", value as Filters["status"])}>
          <option value="all">All statuses</option>
          {TASK_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </FilterSelect>
      </div>
    </div>
  );
}

function FilterSelect({ children, value, onChange }: { children: React.ReactNode; value: string; onChange: (value: string) => void }) {
  return (
    <select
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm outline-none transition hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/20"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  );
}
