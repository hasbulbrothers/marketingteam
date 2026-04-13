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
      <DialogContent className="rounded-[32px] border-none bg-white p-8 sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900">
            {date ? formatDisplayDate(date) : "Selected day"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-7 text-slate-500">
            Tasks scheduled for the selected date.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {tasks.length ? (
            tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelectTask(task)}
                className="w-full rounded-[28px] bg-background px-6 py-5 text-left shadow-sm transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {formatDisplayDate(task.dueDate)} · {task.assignee.name}
                    </p>
                  </div>
                  <Badge variant="secondary">{task.status.replaceAll("_", " ")}</Badge>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-[28px] bg-background px-6 py-8 text-sm text-slate-500 shadow-sm">
              No tasks scheduled on this date.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
