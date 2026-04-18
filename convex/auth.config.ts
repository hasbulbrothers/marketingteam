const clerkDomain =
  process.env.CLERK_JWT_ISSUER_DOMAIN ??
  "https://prime-horse-0.clerk.accounts.dev";

const authConfig = {
  providers: [
    {
      domain: clerkDomain,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
