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
  v.literal("tiktok"),
  v.literal("instagram"),
  v.literal("facebook"),
  v.literal("threads"),
  v.literal("youtube"),
  v.literal("email"),
  v.literal("website"),
);

export const contentTypeValidator = v.union(
  v.literal("awareness"),
  v.literal("authority"),
  v.literal("consideration"),
  v.literal("conversion"),
  v.literal("campaign"),
  v.literal("internal"),
);
