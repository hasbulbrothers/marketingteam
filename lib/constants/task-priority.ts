import { TaskPriority } from "@/types/task";

export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "rounded-lg border-0 bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600",
  medium: "rounded-lg border-0 bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700",
  high: "rounded-lg border-0 bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700",
  urgent: "rounded-lg border-0 bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700",
};
