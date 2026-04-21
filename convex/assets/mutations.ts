import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";
import { enforceRateLimit } from "../lib/rateLimit";

const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf", "video/", "audio/", "text/"];
const MAX_FILENAME_LENGTH = 255;

function isValidAssetUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\]/g, "_").slice(0, MAX_FILENAME_LENGTH);
}

export const createAsset = mutation({
  args: {
    taskId: v.id("tasks"),
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    await enforceRateLimit(ctx, String(currentUser._id), "createAsset", 15, 60_000);
    const task = await ctx.db.get(args.taskId);

    if (!task || task.isArchived) {
      throw new Error("Task not found.");
    }

    if (!args.fileName.trim() || !args.fileUrl.trim() || !args.fileType.trim()) {
      throw new Error("Asset metadata is incomplete.");
    }

    if (!isValidAssetUrl(args.fileUrl)) {
      throw new Error("Invalid asset URL.");
    }

    if (!ALLOWED_MIME_PREFIXES.some((p) => args.fileType.startsWith(p))) {
      throw new Error("Unsupported file type.");
    }

    return ctx.db.insert("assets", {
      ...args,
      fileName: sanitizeFileName(args.fileName),
      uploadedBy: currentUser._id,
      createdAt: Date.now(),
    });
  },
});
