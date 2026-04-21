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
  campaignId: v.optional(v.id("campaigns")),
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
  subtasks?: { id: string; title: string; isCompleted: boolean }[];
  status: string;
  platform: string;
  priority: string;
  contentType: string;
  assigneeId?: unknown;
  campaignId?: unknown;
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
    const [serialized] = await serializeTasks(ctx, [task as unknown as RawTask]);
    return serialized;
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
    if (!isIsoDate(args.startDate) || !isIsoDate(args.endDate)) throw new Error("Tarikh tidak sah. Sila pilih tarikh yang betul.");
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
    if (term.length < 2) return [];
    return serializeTasks(
      ctx,
      filterTasks(await ctx.db.query("tasks").collect(), args).filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          task.description.toLowerCase().includes(term) ||
          task.tags.some((tag: string) => tag.toLowerCase().includes(term)),
      ).slice(0, 100),
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
    if (args.campaignId && task.campaignId !== args.campaignId) return false;
    if (args.priority && task.priority !== args.priority) return false;
    if (args.contentType && task.contentType !== args.contentType) return false;
    return true;
  });
}

async function serializeTasks(ctx: QueryCtx, tasks: RawTask[]) {
  const assigneeIds = [...new Set(tasks.map((t) => t.assigneeId).filter(Boolean))];
  const campaignIds = [...new Set(tasks.map((t) => t.campaignId).filter(Boolean))];

  const [assignees, campaigns] = await Promise.all([
    Promise.all(assigneeIds.map((id) => ctx.db.get(id as never))),
    Promise.all(campaignIds.map((id) => ctx.db.get(id as never))),
  ]);

  const assigneeMap = new Map(
    assignees.filter(Boolean).map((u) => [String(u!._id), u]),
  );
  const campaignMap = new Map(
    campaigns.filter(Boolean).map((c) => [String(c!._id), c]),
  );

  return tasks.map((task) => {
    const assignee = task.assigneeId ? assigneeMap.get(String(task.assigneeId)) : null;
    const campaign = task.campaignId ? campaignMap.get(String(task.campaignId)) : null;
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
      subtasks: task.subtasks ?? [],
      assignee: {
        id: assignee ? String(assignee._id) : "unassigned",
        name: assignee?.name ?? "Unassigned",
        role: assignee?.jobTitle ?? assignee?.role ?? "Team Member",
      },
      campaign: campaign
        ? {
            id: String(campaign._id),
            name: campaign.name,
            status: campaign.status,
          }
        : null,
    };
  });
}
