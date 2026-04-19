import type { GenericDataModel, GenericMutationCtx } from "convex/server";

type MutationCtx = GenericMutationCtx<GenericDataModel>;

type LogParams = {
  userId: unknown;
  action: string;
  entityType: "task" | "campaign" | "user" | "team";
  entityId: string;
  entityName: string;
  changes?: { field: string; before: unknown; after: unknown }[];
};

export async function logActivity(ctx: MutationCtx, params: LogParams) {
  await ctx.db.insert("activityLogs", {
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    changes: params.changes ? JSON.stringify(params.changes) : undefined,
    createdAt: Date.now(),
  } as never);
}

export function diffFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: string[],
) {
  const changes: { field: string; before: unknown; after: unknown }[] = [];
  for (const field of fields) {
    const bVal = before[field];
    const aVal = after[field];
    if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
      changes.push({ field, before: bVal ?? null, after: aVal ?? null });
    }
  }
  return changes;
}
