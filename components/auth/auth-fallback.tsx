import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";

export function AuthFallback({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <AuthShell>
      <Card className="premium-card w-full max-w-md border-none">
        <CardHeader className="space-y-3 p-8">
          <p className="text-sm font-medium text-primary">Clerk setup required</p>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            Authentication preview for {mode.replace("-", " ")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-8 pt-0 text-sm text-slate-500">
          <p>Add Clerk keys in <code>.env.local</code> to enable hosted authentication.</p>
          <div className="rounded-[24px] bg-background p-5">
            <p>Once connected, team members can sign in and continue directly into the workspace.</p>
            <Link className="mt-3 inline-block font-semibold text-primary" href="/">
              Continue to the product preview
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
