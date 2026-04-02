import { Search } from "lucide-react";
import { TASK_PRIORITIES } from "@/lib/constants/task-priority";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { CONTENT_TYPES } from "@/lib/constants/content-types";
import { PLATFORMS } from "@/lib/constants/platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskFiltersState } from "@/types/task";

const ALL = "all";

type Props = {
  filters: TaskFiltersState;
  onChange: <K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) => void;
  onReset: () => void;
};

export function TaskFilters({ filters, onChange, onReset }: Props) {
  return (
    <div className="premium-card grid border-none p-5 lg:grid-cols-[1.1fr_repeat(4,0.75fr)_0.55fr] lg:gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="h-12 rounded-2xl border-none bg-background pl-11 shadow-sm" placeholder="Search title or description" value={filters.query} onChange={(event) => onChange("query", event.target.value)} />
      </div>
      <FilterField value={filters.status ?? ALL} options={TASK_STATUSES.map(toOption)} onChange={(value) => onChange("status", value === ALL ? null : (value as TaskFiltersState["status"]))} />
      <FilterField value={filters.priority ?? ALL} options={TASK_PRIORITIES.map((item) => ({ value: item, label: item }))} onChange={(value) => onChange("priority", value === ALL ? null : (value as TaskFiltersState["priority"]))} />
      <FilterField value={filters.platform ?? ALL} options={PLATFORMS.map((item) => ({ value: item, label: item }))} onChange={(value) => onChange("platform", value === ALL ? null : (value as TaskFiltersState["platform"]))} />
      <FilterField value={filters.contentType ?? ALL} options={CONTENT_TYPES.map((item) => ({ value: item, label: item }))} onChange={(value) => onChange("contentType", value === ALL ? null : (value as TaskFiltersState["contentType"]))} />
      <FilterField value={ALL} options={[{ value: ALL, label: "Due date" }]} onChange={() => undefined} />
      <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={onReset}>Reset</Button>
    </div>
  );
}

function FilterField({ value, options, onChange }: { value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; }) {
  return (
    <select className="h-12 rounded-2xl border-none bg-background px-4 text-sm text-slate-600 shadow-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value={ALL}>All</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function toOption(item: { value: string; label: string }) {
  return { value: item.value, label: item.label };
}
