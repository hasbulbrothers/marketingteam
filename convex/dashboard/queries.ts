import { queryGeneric as query } from "convex/server";
import { requireAuthenticated } from "../lib/auth";
import { isDueThisWeek, isDueToday, isOverdue } from "../lib/dates";

export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireAuthenticated(ctx);
    const tasks = (await ctx.db.query("tasks").collect()).filter(
      (task) => !task.isArchived && task.status !== "archived",
    );

    return {
      totalTasks: tasks.length,
      tasksInProgress: tasks.filter((task) => task.status === "in_progress").length,
      completedTasks: tasks.filter((task) => task.status === "published").length,
      overdueTasks: tasks.filter(
        (task) => isOverdue(task.dueDate) && task.status !== "published",
      ).length,
      tasksDueToday: tasks.filter((task) => isDueToday(task.dueDate)).length,
      tasksDueThisWeek: tasks.filter((task) => isDueThisWeek(task.dueDate)).length,
    };
  },
});
