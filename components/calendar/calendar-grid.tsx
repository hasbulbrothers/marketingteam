import { Badge } from "@/components/ui/badge";
import { MarketingTask } from "@/types/task";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  tasks,
  onSelectDate,
  selectedDate,
}: {
  tasks: MarketingTask[];
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}) {
  const cells = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <div className="premium-card overflow-hidden border-none bg-white">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {days.map((day) => (
          <div key={day} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-white">
        {cells.map((day) => {
          const date = `2026-03-${String(day).padStart(2, "0")}`;
          const dayTasks = tasks.filter((task) => task.dueDate === date).slice(0, 2);
          const isSelected = selectedDate === date;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(date)}
              className="min-h-36 border-r border-b border-slate-200 p-4 text-left last:border-r-0 hover:bg-slate-50/50"
            >
              <p className={isSelected ? "text-sm font-semibold text-primary" : "text-sm font-semibold text-slate-800"}>{day}</p>
              <div className="mt-3 space-y-2">
                {dayTasks.map((task) => (
                  <div key={task.id} className="rounded-[18px] bg-background px-3 py-3 shadow-sm ring-1 ring-black/5">
                    <p className="truncate text-xs font-semibold text-slate-800">{task.title}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <Badge variant="secondary">{task.platform}</Badge>
                      <span className="text-right text-[11px] font-medium text-slate-400">
                        {task.assignee.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
