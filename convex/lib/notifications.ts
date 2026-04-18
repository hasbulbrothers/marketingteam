import type { GenericDataModel, GenericMutationCtx } from "convex/server";

type MutationCtx = GenericMutationCtx<GenericDataModel>;

type NotifyParams = {
  recipientId: unknown;
  senderId?: unknown;
  type: "task_assigned" | "task_status_changed" | "task_commented" | "role_changed";
  title: string;
  message: string;
  taskId?: unknown;
};

export async function notify(ctx: MutationCtx, params: NotifyParams) {
  if (params.senderId && String(params.recipientId) === String(params.senderId)) return;

  await ctx.db.insert("notifications", {
    recipientId: params.recipientId,
    senderId: params.senderId,
    type: params.type,
    title: params.title,
    message: params.message,
    taskId: params.taskId,
    isRead: false,
    createdAt: Date.now(),
  } as never);
}
