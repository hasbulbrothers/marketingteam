import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  contentTypeValidator,
  platformValidator,
  priorityValidator,
  roleValidator,
  taskStatusValidator,
} from "./lib/validators";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: roleValidator,
    department: v.string(),
    jobTitle: v.string(),
    avatarUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    platform: platformValidator,
    contentType: contentTypeValidator,
    status: taskStatusValidator,
    priority: priorityValidator,
    tags: v.array(v.string()),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    createdBy: v.id("users"),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assigneeId"])
    .index("by_platform", ["platform"])
    .index("by_due_date", ["dueDate"])
    .index("by_created_by", ["createdBy"])
    .index("by_status_due_date", ["status", "dueDate"])
    .index("by_assignee_status", ["assigneeId", "status"]),

  comments: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    message: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_task_created_at", ["taskId", "createdAt"])
    .index("by_user", ["userId"]),

  assets: defineTable({
    taskId: v.id("tasks"),
    uploadedBy: v.id("users"),
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_uploaded_by", ["uploadedBy"]),
});
