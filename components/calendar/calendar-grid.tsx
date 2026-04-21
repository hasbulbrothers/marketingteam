import { Plus } from "lucide-react";
import { format, isToday, isSameDay, isSameMonth, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MarketingTask } from "@/types/task";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_DOT: Record<string, string> = {
  idea: "bg-slate-400",
  planning: "bg-violet-500",
  in_progress: "bg-blue-500",
  review: "bg-amber-500",
  scheduled: "bg-indigo-500",
  published: "bg-emerald-500",
  archived: "bg-slate-300",
};

export function CalendarGrid({
  currentDate,
  visibleDays,
  tasks,
  onSelectDate,
  onCreateTaskAtDate,
  selectedDate,
  showOutsideDays,
}: {
  currentDate: Date;
  visibleDays: Date[];
  tasks: MarketingTask[];
  onSelectDate: (date: string) => void;
  onCreateTaskAtDate?: (date: string) => void;
  selectedDate: string | null;
  showOutsideDays: boolean;
}) {
  const isWeekView = visibleDays.length <= 7;

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
        {days.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400 sm:px-4">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {visibleDays.map((day, idx) => {
          const date = format(day, "yyyy-MM-dd");
          const dayTasks = tasks.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), day));
          const displayTasks = dayTasks.slice(0, 3);
          const overflow = dayTasks.length - displayTasks.length;
          const isSelected = selectedDate === date;
          const today = isToday(day);
          const inMonth = showOutsideDays ? isSameMonth(day, currentDate) : true;
          const isLastCol = (idx + 1) % 7 === 0;
          const isLastRow = idx >= visibleDays.length - 7;

          return (
            <div
              key={date}
              className={`${isWeekView ? "min-h-48" : "min-h-28 sm:min-h-36"} ${!isLastCol ? "border-r border-slate-100" : ""} ${!isLastRow ? "border-b border-slate-100" : ""} ${today ? "bg-primary/[0.03]" : ""} ${isSelected ? "bg-primary/[0.06]" : ""} ${!inMonth ? "bg-slate-50/50" : ""} group relative p-1.5 transition-colors sm:p-3`}
            >
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => onSelectDate(date)} className="text-left">
                  {today ? (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {format(day, "d")}
                    </span>
                  ) : (
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${isSelected ? "bg-primary/10 text-primary" : inMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-300"}`}>
                      {format(day, "d")}
                    </span>
                  )}
                </button>
                {onCreateTaskAtDate && (
                  <button
                    type="button"
                    onClick={() => onCreateTaskAtDate(date)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-300 opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100"
                    aria-label={`Add task for ${date}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button type="button" onClick={() => onSelectDate(date)} className="mt-1 block w-full space-y-1 text-left">
                {displayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-1.5 rounded-lg bg-white/80 px-2 py-1 shadow-sm ring-1 ring-black/[0.04] transition hover:ring-primary/20">
                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[task.status] ?? "bg-slate-400"}`} />
                    <p className="truncate text-[11px] font-medium text-slate-700">{task.title}</p>
                  </div>
                ))}
                {overflow > 0 && (
                  <p className="px-2 text-[10px] font-medium text-slate-400">+{overflow} more</p>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
