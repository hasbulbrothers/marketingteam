import { Sparkles } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r border-slate-200 bg-white px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">HB Marketing</p>
            <p className="text-xs font-medium text-slate-400">Task Manager</p>
          </div>
        </div>
        <div className="max-w-md space-y-5">
          <p className="text-sm font-medium text-primary">Internal workspace</p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Keep content, approvals, and publishing in one calm flow.
          </h1>
          <p className="text-base leading-8 font-light text-slate-500">
            A minimal home base for content creators, copywriters, designers, editors, and managers to stay aligned without extra friction.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Feature label="Task visibility" copy="Clear status across the content pipeline." />
          <Feature label="Fast reviews" copy="Feedback and approval notes stay with the task." />
          <Feature label="Live updates" copy="The whole team sees changes immediately." />
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10 sm:px-6">{children}</section>
    </main>
  );
}

function Feature({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-background px-4 py-4">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="mt-2 text-xs leading-6 text-slate-500">{copy}</p>
    </div>
  );
}
