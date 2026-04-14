import type { GenericDataModel, GenericQueryCtx } from "convex/server";
import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";
import { isIsoDate, isOverdue } from "../lib/dates";
import {
  contentTypeValidator,
  platformValidator,
  priorityValidator,
  taskStatusValidator,
} from "../lib/validators";

const filters = {
  status: v.optional(taskStatusValidator),
  platform: v.optional(platformValidator),
  assigneeId: v.optional(v.id("users")),
  priority: v.optional(priorityValidator),
  contentType: v.optional(contentTypeValidator),
  includeArchived: v.optional(v.boolean()),
};

type QueryCtx = GenericQueryCtx<GenericDataModel>;
type RawTask = {
  _id: unknown;
  title: string;
  description: string;
  tags: string[];
  status: string;
  platform: string;
  priority: string;
  contentType: string;
  assigneeId?: unknown;
  dueDate?: string;
  isArchived: boolean;
};

export const getTasks = query({
  args: filters,
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    return serializeTasks(ctx, filterTasks(await ctx.db.query("tasks").collect(), args));
  },
});

export const getTaskById = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;
    return serializeTask(ctx, task);
  },
});

export const getTasksByStatus = query({
  args: { status: taskStatusValidator, includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    return serializeTasks(
      ctx,
      filterTasks(await ctx.db.query("tasks").withIndex("by_status", (q) => q.eq("status", args.status)).collect(), args),
    );
  },
});

export const getTasksByAssignee = query({
  args: { assigneeId: v.id("users"), includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    return serializeTasks(
      ctx,
      filterTasks(await ctx.db.query("tasks").withIndex("by_assignee", (q) => q.eq("assigneeId", args.assigneeId)).collect(), args),
    );
  },
});

export const getOverdueTasks = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    return serializeTasks(
      ctx,
      filterTasks(await ctx.db.query("tasks").collect(), args).filter(
        (task) => isOverdue(task.dueDate) && !["published", "archived"].includes(task.status),
      ),
    );
  },
});

export const getCalendarTasks = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    platform: v.optional(platformValidator),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    if (!isIsoDate(args.startDate) || !isIsoDate(args.endDate)) throw new Error("Calendar range must use valid ISO date strings.");
    return serializeTasks(
      ctx,
      filterTasks(await ctx.db.query("tasks").collect(), { ...args, includeArchived: false }).filter(
        (task) => task.dueDate && task.dueDate >= args.startDate && task.dueDate <= args.endDate,
      ),
    );
  },
});

export const searchTasks = query({
  args: { query: v.string(), includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    const term = args.query.trim().toLowerCase();
    if (!term) return [];
    return serializeTasks(
      ctx,
      filterTasks(await ctx.db.query("tasks").collect(), args).filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          task.description.toLowerCase().includes(term) ||
          task.tags.some((tag: string) => tag.toLowerCase().includes(term)),
      ),
    );
  },
});

function filterTasks(tasks: RawTask[], args: Record<string, unknown>) {
  const includeArchived = Boolean(args.includeArchived);
  return tasks.filter((task) => {
    if (!includeArchived && (task.isArchived || task.status === "archived")) return false;
    if (args.status && task.status !== args.status) return false;
    if (args.platform && task.platform !== args.platform) return false;
    if (args.assigneeId && task.assigneeId !== args.assigneeId) return false;
    if (args.priority && task.priority !== args.priority) return false;
    if (args.contentType && task.contentType !== args.contentType) return false;
    return true;
  });
}

async function serializeTasks(ctx: QueryCtx, tasks: RawTask[]) {
  return Promise.all(tasks.map((task) => serializeTask(ctx, task)));
}

async function serializeTask(ctx: QueryCtx, task: RawTask) {
  const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId as never) : null;
  return {
    id: String(task._id),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? null,
    platform: task.platform,
    contentType: task.contentType,
    tags: task.tags,
    assignee: {
      id: assignee ? String(assignee._id) : "unassigned",
      name: assignee?.name ?? "Unassigned",
      role: assignee?.jobTitle ?? assignee?.role ?? "Team Member",
    },
  };
}
