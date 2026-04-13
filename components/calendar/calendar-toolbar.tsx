import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="premium-card border-none p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
            <IconButton onClick={() => onMonthChange("prev")}><ChevronLeft className="h-4 w-4" /></IconButton>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">{periodLabel}</p>
            <p className="text-sm text-slate-400">{filters.view === "week" ? "Week view for campaign deadlines and publishing dates." : "Month view for campaign deadlines and publishing dates."}</p>
          </div>
          <IconButton onClick={() => onMonthChange("next")}><ChevronRight className="h-4 w-4" /></IconButton>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Select value={filters.platform} onChange={(value) => onFilterChange("platform", value as Filters["platform"])}>
            <option value="all">All platforms</option>
            {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
          </Select>
          <Select value={filters.assigneeId} onChange={(value) => onFilterChange("assigneeId", value)}>
            <option value="all">All assignees</option>
            {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}
          </Select>
          <Select value={filters.status} onChange={(value) => onFilterChange("status", value as Filters["status"])}>
            <option value="all">All status</option>
            {TASK_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </Select>
          <Select value={filters.view} onChange={(value) => onFilterChange("view", value as Filters["view"])}>
            <option value="month">Month view</option>
            <option value="week">Week view</option>
          </Select>
        </div>
      </div>
    </div>
  );
}

function IconButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 bg-white" onClick={onClick}>{children}</Button>;
}

function Select({ children, value, onChange }: { children: React.ReactNode; value: string; onChange: (value: string) => void }) {
  return <select className="rounded-2xl bg-background px-4 py-3 text-sm text-slate-500 shadow-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>;
}
