import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  campaignStatusValidator,
  contentTypeValidator,
  kpiMetricValidator,
  kpiPeriodValidator,
  kpiScopeValidator,
  notificationTypeValidator,
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
    teamId: v.optional(v.id("teams")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_team", ["teamId"]),

  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    leaderId: v.optional(v.id("users")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  campaigns: defineTable({
    name: v.string(),
    objective: v.string(),
    description: v.optional(v.string()),
    status: campaignStatusValidator,
    ownerId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    budget: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_team", ["teamId"])
    .index("by_status", ["status"])
    .index("by_active", ["isActive"]),

  campaignMetrics: defineTable({
    campaignId: v.id("campaigns"),
    date: v.string(),
    channel: platformValidator,
    spend: v.number(),
    reach: v.number(),
    clicks: v.number(),
    leads: v.number(),
    participants: v.number(),
    conversions: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_date", ["date"])
    .index("by_channel", ["channel"])
    .index("by_campaign_date", ["campaignId", "date"]),

  kpiTargets: defineTable({
    scope: kpiScopeValidator,
    teamId: v.optional(v.id("teams")),
    userId: v.optional(v.id("users")),
    metric: kpiMetricValidator,
    target: v.number(),
    period: kpiPeriodValidator,
    startDate: v.string(),
    endDate: v.string(),
    platform: v.optional(platformValidator),
    label: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    platform: platformValidator,
    contentType: contentTypeValidator,
    status: taskStatusValidator,
    priority: priorityValidator,
    tags: v.array(v.string()),
    assigneeId: v.optional(v.id("users")),
    campaignId: v.optional(v.id("campaigns")),
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
    .index("by_campaign", ["campaignId"])
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

  notifications: defineTable({
    recipientId: v.id("users"),
    senderId: v.optional(v.id("users")),
    type: notificationTypeValidator,
    title: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_read", ["recipientId", "isRead"])
    .index("by_recipient_created", ["recipientId", "createdAt"]),

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
