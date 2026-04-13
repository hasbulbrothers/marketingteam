"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CurrentUserProfile } from "@/types/user";

export function UserRolePill() {
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
