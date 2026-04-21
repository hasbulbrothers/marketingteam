import type {
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";

type ConvexCtx = GenericMutationCtx<GenericDataModel> | GenericQueryCtx<GenericDataModel>;

export async function requireAuthenticated(ctx: ConvexCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Sila log masuk untuk teruskan.");
  }

  return identity;
}

export async function findCurrentUser(ctx: ConvexCtx) {
  const identity = await requireAuthenticated(ctx);
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export async function requireCurrentUser(ctx: ConvexCtx) {
  const user = await findCurrentUser(ctx);

  if (!user || !user.isActive) {
    throw new Error("Akaun anda tidak aktif. Sila hubungi admin.");
  }

  return user;
}
