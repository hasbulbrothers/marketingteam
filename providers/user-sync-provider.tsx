"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const upsertUser = useMutation(api.users.mutations.upsertUserFromClerk);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    void upsertUser({
      name: user.fullName ?? user.firstName ?? "HB Marketing User",
      email: user.primaryEmailAddress.emailAddress,
      department: "Marketing",
      jobTitle: "Team Member",
      avatarUrl: user.imageUrl,
    });
  }, [isLoaded, isSignedIn, upsertUser, user]);

  return children;
}
