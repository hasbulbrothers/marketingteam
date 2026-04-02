import { SignUp } from "@clerk/nextjs";
import { AuthFallback } from "@/components/auth/auth-fallback";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <AuthFallback mode="sign-up" />;
  }

  return (
    <AuthShell>
      <SignUp />
    </AuthShell>
  );
}
