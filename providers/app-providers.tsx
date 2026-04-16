"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexAppProvider } from "@/providers/convex-provider";
import { UserSyncProvider } from "@/providers/user-sync-provider";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <ConvexAppProvider>
      {hasConvex ? <UserSyncProvider>{children}</UserSyncProvider> : children}
    </ConvexAppProvider>
  );

  if (!publishableKey) {
    return content;
  }

  return <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/sign-in">{content}</ClerkProvider>;
}
