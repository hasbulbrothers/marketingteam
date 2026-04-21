import type { GenericDataModel, GenericMutationCtx } from "convex/server";
import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { logActivity, diffFields } from "../lib/activityLogger";
import { requireCurrentUser } from "../lib/auth";
import { isIsoDate } from "../lib/dates";
import { notify } from "../lib/notifications";
import { requireAdmin, requireTaskAccess } from "../lib/permissions";
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
  campaignId: v.optional(v.id("campaigns")),
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
    await ensureCampaignExists(ctx, args.campaignId);

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      createdBy: currentUser._id,
      isArchived: false,
      publishedAt: args.status === "published" ? new Date().toISOString() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      userId: currentUser._id,
      action: "task.created",
      entityType: "task",
      entityId: String(taskId),
      entityName: args.title,
    });

    if (args.assigneeId) {
      await notify(ctx, {
        recipientId: args.assigneeId as unknown,
        senderId: currentUser._id as unknown,
        type: "task_assigned",
        title: "New task assigned",
        message: `You have been assigned to "${args.title}"`,
        taskId: taskId as unknown,
      });
    }

    return taskId;
  },
});

export const updateTask = mutation({
  args: { taskId: v.id("tasks"), ...taskFields },
  handler: async (ctx, args) => {
    const currentUser = await requireTaskAccess(ctx, args.taskId);
    validateTaskPayload(args.title, args.description, args.tags, args.dueDate, args.scheduledAt);
    const existing = await ensureTaskExists(ctx, args.taskId);
    await ensureAssigneeExists(ctx, args.assigneeId);
    await ensureCampaignExists(ctx, args.campaignId);

    const { taskId, ...updateFields } = args;
    const changes = diffFields(existing as Record<string, unknown>, updateFields, [
      "title", "description", "platform", "contentType", "priority", "assigneeId", "campaignId", "dueDate", "scheduledAt",
    ]);
    await ctx.db.patch(taskId, { ...updateFields, updatedAt: Date.now() });

    if (changes.length > 0) {
      await logActivity(ctx, {
        userId: currentUser._id,
        action: "task.updated",
        entityType: "task",
        entityId: String(taskId),
        entityName: existing.title as string,
        changes,
      });
    }
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const task = await ensureTaskExists(ctx, args.taskId);
    await ctx.db.patch(args.taskId, {
      isArchived: true,
      status: "archived",
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      userId: admin._id,
      action: "task.deleted",
      entityType: "task",
      entityId: String(args.taskId),
      entityName: task.title as string,
    });
  },
});

export const moveTaskStatus = mutation({
  args: { taskId: v.id("tasks"), status: taskStatusValidator },
  handler: async (ctx, args) => {
    const currentUser = await requireTaskAccess(ctx, args.taskId);
    const task = await ensureTaskExists(ctx, args.taskId);
    const oldStatus = task.status as string;
    await ctx.db.patch(args.taskId, {
      status: args.status,
      publishedAt: args.status === "published" ? new Date().toISOString() : undefined,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      userId: currentUser._id,
      action: "task.status_changed",
      entityType: "task",
      entityId: String(args.taskId),
      entityName: task.title as string,
      changes: [{ field: "status", before: oldStatus, after: args.status }],
    });

    if (task.assigneeId) {
      await notify(ctx, {
        recipientId: task.assigneeId as unknown,
        senderId: currentUser._id as unknown,
        type: "task_status_changed",
        title: "Task status updated",
        message: `"${task.title}" moved to ${(args.status as string).replace("_", " ")}`,
        taskId: args.taskId as unknown,
      });
    }
    if (task.createdBy && String(task.createdBy) !== String(task.assigneeId)) {
      await notify(ctx, {
        recipientId: task.createdBy as unknown,
        senderId: currentUser._id as unknown,
        type: "task_status_changed",
        title: "Task status updated",
        message: `"${task.title}" moved to ${(args.status as string).replace("_", " ")}`,
        taskId: args.taskId as unknown,
      });
    }
  },
});

export const assignTask = mutation({
  args: { taskId: v.id("tasks"), assigneeId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await requireAdmin(ctx);
    const task = await ensureTaskExists(ctx, args.taskId);
    await ensureAssigneeExists(ctx, args.assigneeId);
    const oldAssigneeId = task.assigneeId ? String(task.assigneeId) : null;
    await ctx.db.patch(args.taskId, { assigneeId: args.assigneeId, updatedAt: Date.now() });

    await logActivity(ctx, {
      userId: currentUser._id,
      action: "task.assigned",
      entityType: "task",
      entityId: String(args.taskId),
      entityName: task.title as string,
      changes: [{ field: "assigneeId", before: oldAssigneeId, after: String(args.assigneeId) }],
    });

    await notify(ctx, {
      recipientId: args.assigneeId as unknown,
      senderId: currentUser._id as unknown,
      type: "task_assigned",
      title: "Task assigned to you",
      message: `You have been assigned to "${task.title}"`,
      taskId: args.taskId as unknown,
    });
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

async function ensureCampaignExists(
  ctx: MutationCtx,
  campaignId?: RecordId,
) {
  if (!campaignId) return;
  const campaign = await ctx.db.get(campaignId);
  if (!campaign || !campaign.isActive) throw new Error("Campaign not found or inactive.");
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
  if (tags.length > 10 || tags.some((tag) => !tag.trim() || tag.trim().length > 50)) {
    throw new Error("Use up to 10 tags, each between 1 and 50 characters.");
  }
  if (dueDate && !isIsoDate(dueDate)) {
    throw new Error("Due date must be a valid ISO date string.");
  }
  if (scheduledAt && !isIsoDate(scheduledAt)) {
    throw new Error("Scheduled date must be a valid ISO date string.");
  }
}
