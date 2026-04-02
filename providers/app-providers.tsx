"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexAppProvider } from "@/providers/convex-provider";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AppProviders({ children }: { children: React.ReactNode }) {
  const content = <ConvexAppProvider>{children}</ConvexAppProvider>;

  if (!publishableKey) {
    return content;
  }

  return <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>;
}
