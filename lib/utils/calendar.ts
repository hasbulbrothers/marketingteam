import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { MarketingTask, Platform, TaskStatus } from "@/types/task";

type CalendarView = "month" | "week";

export function changePeriod(current: Date, direction: "prev" | "next", view: CalendarView) {
  return view === "week"
    ? addWeeks(current, direction === "next" ? 1 : -1)
    : addMonths(current, direction === "next" ? 1 : -1);
}

export function formatPeriodLabel(date: Date, view: CalendarView) {
  return format(date, view === "week" ? "dd MMM yyyy" : "MMMM yyyy");
}

export function buildVisibleDays(date: Date, view: CalendarView) {
  if (view === "week") {
    return eachDayOfInterval({ start: startOfWeek(date), end: endOfWeek(date) });
  }

  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(date)),
    end: endOfWeek(endOfMonth(date)),
  });
}

export function filterCalendarTasks(
  tasks: MarketingTask[],
  currentDate: Date,
  view: CalendarView,
  filters: { platform: Platform | "all"; assigneeId: string | "all"; status: TaskStatus | "all" },
) {
  const range = view === "week"
    ? { start: startOfWeek(currentDate), end: endOfWeek(currentDate) }
    : { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };

  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = parseISO(task.dueDate);
    if (!isWithinInterval(dueDate, range)) return false;
    if (filters.platform !== "all" && task.platform !== filters.platform) return false;
    if (filters.assigneeId !== "all" && task.assignee.id !== filters.assigneeId) return false;
    if (filters.status !== "all" && task.status !== filters.status) return false;
    return true;
  });
}
