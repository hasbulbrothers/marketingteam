"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CurrentUserProfile } from "@/types/user";

const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function UserRolePill() {
  if (!hasConvex || !hasClerk) {
    return null;
  }

  return <LiveUserRolePill />;
}

function LiveUserRolePill() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const user = useQuery(api.users.queries.getCurrentUser, isAuthed ? {} : "skip") as CurrentUserProfile | null | undefined;

  if (!isAuthed || !user) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {user.role === "admin" ? "Admin" : "Team"}
    </div>
  );
}
