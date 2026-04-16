import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("admin"),
  v.literal("manager"),
  v.literal("team_member"),
);

export const taskStatusValidator = v.union(
  v.literal("idea"),
  v.literal("planning"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("archived"),
);

export const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent"),
);

export const platformValidator = v.union(
  v.literal("TikTok"),
  v.literal("Instagram"),
  v.literal("Facebook"),
  v.literal("Threads"),
  v.literal("YouTube"),
  v.literal("Email"),
  v.literal("Website"),
);

export const contentTypeValidator = v.union(
  v.literal("Awareness"),
  v.literal("Authority"),
  v.literal("Consideration"),
  v.literal("Conversion"),
  v.literal("Campaign"),
  v.literal("Internal"),
);

export const kpiScopeValidator = v.union(
  v.literal("team"),
  v.literal("user"),
);

export const kpiMetricValidator = v.union(
  v.literal("tasks_completed"),
  v.literal("tasks_on_time"),
  v.literal("posts_published"),
  v.literal("average_lead_time_days"),
);

export const kpiPeriodValidator = v.union(
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("quarterly"),
);
