import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDisplayDate } from "@/lib/utils/date";
import { MarketingTask } from "@/types/task";

const STATUS_COLOR: Record<string, string> = {
  idea: "bg-slate-100 text-slate-600",
  planning: "bg-violet-50 text-violet-700",
  in_progress: "bg-blue-50 text-blue-700",
  review: "bg-amber-50 text-amber-700",
  scheduled: "bg-indigo-50 text-indigo-700",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-50 text-slate-500",
};

export function CalendarDayPopup({
  date,
  open,
  tasks,
  onSelectTask,
  onOpenChange,
}: {
  date: string | null;
  open: boolean;
  tasks: MarketingTask[];
  onSelectTask: (task: MarketingTask) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px] border-none bg-white p-6 sm:max-w-lg">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
            {date ? formatDisplayDate(date) : "Selected day"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {tasks.length === 0 ? "No tasks on this date." : `${tasks.length} task${tasks.length > 1 ? "s" : ""} scheduled`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelectTask(task)}
                className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{task.title}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                      <span>{task.assignee.name}</span>
                      <span>·</span>
                      <Badge variant="secondary" className="text-[10px]">{task.platform}</Badge>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[task.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {task.status.replaceAll("_", " ")}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
              No tasks scheduled on this date.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
