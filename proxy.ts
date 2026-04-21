import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/tasks(.*)",
  "/calendar(.*)",
  "/team(.*)",

  "/reports(.*)",
  "/analytics(.*)",
  "/activity(.*)",
  "/settings(.*)",
]);
const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default clerkMiddleware(async (auth, req) => {
  if (!hasClerk || !isProtectedRoute(req)) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: ["/((?!.*\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
