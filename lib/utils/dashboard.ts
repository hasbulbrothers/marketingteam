import { isBefore, parseISO } from "date-fns";
import { DashboardStat, WorkloadItem } from "@/types/dashboard";
import { MarketingTask } from "@/types/task";

export function buildDashboardStats(tasks: MarketingTask[]): DashboardStat[] {
  const overdue = tasks.filter(
    (task) => task.status !== "published" && task.dueDate && isBefore(parseISO(task.dueDate), new Date()),
  ).length;
  const dueToday = tasks.filter((task) => task.dueDate === new Date().toISOString().slice(0, 10)).length;

  return [
    { label: "Total Tasks", value: String(tasks.length), description: "All live tasks in the workspace" },
    { label: "In Progress", value: count(tasks, "in_progress"), description: "Currently in production" },
    { label: "Review", value: count(tasks, "review"), description: "Waiting for feedback" },
    { label: "Overdue", value: String(overdue), description: "Need attention today" },
    { label: "Due Today", value: String(dueToday), description: "Scheduled for today" },
    { label: "Published", value: count(tasks, "published"), description: "Already delivered" },
  ];
}

export function buildWorkload(tasks: MarketingTask[]): WorkloadItem[] {
  const counts = new Map<string, WorkloadItem>();

  tasks.forEach((task) => {
    const current = counts.get(task.assignee.id) ?? {
      name: task.assignee.name,
      role: task.assignee.role,
      tasks: 0,
      overdue: 0,
      completed: 0,
      load: 0,
    };

    if (task.status === "published") {
      current.completed += 1;
    } else {
      current.tasks += 1;
      current.load = Math.min(current.tasks * 24, 100);
      if (task.dueDate && isBefore(parseISO(task.dueDate), new Date())) {
        current.overdue += 1;
      }
    }

    counts.set(task.assignee.id, current);
  });

  return Array.from(counts.values()).sort((a, b) => b.tasks - a.tasks || b.overdue - a.overdue);
}

function count(tasks: MarketingTask[], status: MarketingTask["status"]) {
  return String(tasks.filter((task) => task.status === status).length);
}
