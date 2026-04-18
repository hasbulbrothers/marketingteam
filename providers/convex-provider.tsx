"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function useAuthFromClerk() {
  const { isLoaded, isSignedIn, getToken, orgId, orgRole } = useAuth();
  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      try {
        return await getToken({ template: "convex", skipCache: forceRefreshToken });
      } catch {
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgId, orgRole],
  );
  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isSignedIn ?? false,
      fetchAccessToken,
    }),
    [isLoaded, isSignedIn, fetchAccessToken],
  );
}

export function ConvexAppProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    if (!convexUrl) {
      return null;
    }

    return new ConvexReactClient(convexUrl);
  }, []);

  if (!client || !hasClerk) {
    return client ? <ConvexProvider client={client}>{children}</ConvexProvider> : children;
  }

  return (
    <ConvexProviderWithAuth client={client} useAuth={useAuthFromClerk}>
      {children}
    </ConvexProviderWithAuth>
  );
}
