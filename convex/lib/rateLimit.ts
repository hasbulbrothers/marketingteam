import type { GenericDataModel, GenericMutationCtx } from "convex/server";

type MutationCtx = GenericMutationCtx<GenericDataModel>;

export async function enforceRateLimit(
  ctx: MutationCtx,
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number,
) {
  const key = `${action}:${userId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = ctx.db as any;
  const all = await db
    .query("rateLimits")
    .withIndex("by_key", (q: { eq: (f: string, v: string) => unknown }) => q.eq("key", key))
    .unique() as { _id: unknown; timestamps: number[] } | null;

  const recent = all?.timestamps.filter((t) => t > windowStart) ?? [];

  if (recent.length >= maxRequests) {
    throw new Error("Terlalu banyak permintaan. Cuba sebentar lagi.");
  }

  recent.push(now);

  if (all) {
    await db.patch(all._id, { timestamps: recent });
  } else {
    await db.insert("rateLimits", { key, timestamps: recent });
  }
}
