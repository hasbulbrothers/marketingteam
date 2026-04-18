"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const upsertUser = useMutation(api.users.mutations.upsertUserFromClerk);
  const syncedUserIdRef = useRef<string | null>(null);
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;
  const userId = user?.id ?? null;
  const name = user?.fullName ?? user?.firstName ?? "HB Marketing User";
  const avatarUrl = user?.imageUrl;

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !email) {
      return;
    }

    if (syncedUserIdRef.current === userId) {
      return;
    }

    syncedUserIdRef.current = userId;

    void upsertUser({
      name,
      email,
      department: "Marketing",
      jobTitle: "Team Member",
      avatarUrl,
    }).catch(() => {
      syncedUserIdRef.current = null;
    });
  }, [avatarUrl, email, isLoaded, isSignedIn, name, upsertUser, userId]);

  return children;
}
