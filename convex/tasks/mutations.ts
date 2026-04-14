import type { GenericDataModel, GenericMutationCtx } from "convex/server";
import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";
import { isIsoDate } from "../lib/dates";
import { requireManagerOrAdmin, requireTaskAccess } from "../lib/permissions";
import {
  contentTypeValidator,
  platformValidator,
  priorityValidator,
  taskStatusValidator,
} from "../lib/validators";

const taskFields = {
  title: v.string(),
  description: v.string(),
  platform: platformValidator,
  contentType: contentTypeValidator,
  priority: priorityValidator,
  tags: v.array(v.string()),
  assigneeId: v.optional(v.id("users")),
  dueDate: v.optional(v.string()),
  scheduledAt: v.optional(v.string()),
};

type MutationCtx = GenericMutationCtx<GenericDataModel>;
type RecordId = Parameters<MutationCtx["db"]["get"]>[0];

export const createTask = mutation({
  args: { ...taskFields, status: taskStatusValidator },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    validateTaskPayload(args.title, args.description, args.tags, args.dueDate, args.scheduledAt);
    await ensureAssigneeExists(ctx, args.assigneeId);

    return ctx.db.insert("tasks", {
      ...args,
      createdBy: currentUser._id,
      isArchived: false,
      publishedAt: args.status === "published" ? new Date().toISOString() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateTask = mutation({
  args: { taskId: v.id("tasks"), ...taskFields },
  handler: async (ctx, args) => {
    await requireTaskAccess(ctx, args.taskId);
    validateTaskPayload(args.title, args.description, args.tags, args.dueDate, args.scheduledAt);
    await ensureTaskExists(ctx, args.taskId);
    await ensureAssigneeExists(ctx, args.assigneeId);

    const { taskId, ...updateFields } = args;
    await ctx.db.patch(taskId, { ...updateFields, updatedAt: Date.now() });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    await ensureTaskExists(ctx, args.taskId);
    await ctx.db.patch(args.taskId, {
      isArchived: true,
      status: "archived",
      updatedAt: Date.now(),
    });
  },
});

export const moveTaskStatus = mutation({
  args: { taskId: v.id("tasks"), status: taskStatusValidator },
  handler: async (ctx, args) => {
    await requireTaskAccess(ctx, args.taskId);
    await ensureTaskExists(ctx, args.taskId);
    await ctx.db.patch(args.taskId, {
      status: args.status,
      publishedAt: args.status === "published" ? new Date().toISOString() : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const assignTask = mutation({
  args: { taskId: v.id("tasks"), assigneeId: v.id("users") },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    await ensureTaskExists(ctx, args.taskId);
    await ensureAssigneeExists(ctx, args.assigneeId);
    await ctx.db.patch(args.taskId, { assigneeId: args.assigneeId, updatedAt: Date.now() });
  },
});

async function ensureTaskExists(ctx: MutationCtx, taskId: RecordId) {
  const task = await ctx.db.get(taskId);
  if (!task) throw new Error("Task not found.");
  return task;
}

async function ensureAssigneeExists(
  ctx: MutationCtx,
  assigneeId?: RecordId,
) {
  if (!assigneeId) return;
  const user = await ctx.db.get(assigneeId);
  if (!user || !user.isActive) throw new Error("Assignee not found or inactive.");
}

function validateTaskPayload(
  title: string,
  description: string,
  tags: string[],
  dueDate?: string,
  scheduledAt?: string,
) {
  if (title.trim().length < 3 || title.trim().length > 160) {
    throw new Error("Title must be between 3 and 160 characters.");
  }
  if (!description.trim() || description.trim().length > 5000) {
    throw new Error("Description must be between 1 and 5000 characters.");
  }
  if (tags.length > 10 || tags.some((tag) => !tag.trim())) {
    throw new Error("Use up to 10 non-empty tags.");
  }
  if (dueDate && !isIsoDate(dueDate)) {
    throw new Error("Due date must be a valid ISO date string.");
  }
  if (scheduledAt && !isIsoDate(scheduledAt)) {
    throw new Error("Scheduled date must be a valid ISO date string.");
  }
}
