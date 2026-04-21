import type {
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { requireCurrentUser } from "./auth";

type ConvexCtx = GenericMutationCtx<GenericDataModel> | GenericQueryCtx<GenericDataModel>;

export async function requireAdmin(ctx: ConvexCtx) {
  const user = await requireCurrentUser(ctx);

  if (user.role !== "admin") {
    throw new Error("Anda tiada kebenaran. Hanya admin boleh buat ini.");
  }

  return user;
}

export async function requireTaskAccess(
  ctx: ConvexCtx,
  taskId: string,
) {
  const user = await requireCurrentUser(ctx);

  if (user.role === "admin") {
    return user;
  }

  const task = await ctx.db.get(taskId as never);

  if (!task || (task.assigneeId !== user._id && task.createdBy !== user._id)) {
    throw new Error("Anda tiada akses kepada task ini.");
  }

  return user;
}
