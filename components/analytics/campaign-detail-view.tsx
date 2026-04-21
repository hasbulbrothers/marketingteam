"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowLeft, ChartColumnIncreasing, Funnel, Target } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";

export function CampaignDetailView({ campaignId }: { campaignId: string }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <section className="premium-card border-none p-8">
        <p className="text-sm text-slate-500">Connect Clerk and Convex to see live campaign detail data.</p>
      </section>
    );
  }

  return <LiveCampaignDetailView campaignId={campaignId} />;
}

function LiveCampaignDetailView({ campaignId }: { campaignId: string }) {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const detail = useQuery(
    api.campaigns.queries.getCampaignDetail,
    isAuthed ? ({ campaignId } as never) : "skip",
  );

  if (!isAuthed) {
    return (
      <section className="premium-card border-none p-8">
        <p className="text-sm text-slate-500">Connect Clerk and Convex to see live campaign detail data.</p>
      </section>
    );
  }

  if (detail === undefined) {
    return (
      <section className="premium-card border-none p-8">
        <p className="text-sm text-slate-500">Loading campaign detail...</p>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="premium-card border-none p-8">
        <p className="text-sm text-slate-500">Campaign not found.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/analytics" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-black/5 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to analytics
        </Link>
        <Badge variant="outline">{detail.status}</Badge>
        <Badge variant="secondary">{detail.team}</Badge>
      </div>

      <section className="premium-card border-none bg-[radial-gradient(circle_at_top_left,_rgba(19,78,74,0.1),_transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-sm font-medium text-primary">{detail.objective}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{detail.name}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
              {detail.description || "Campaign detail workspace for budget pacing, funnel tracking, channel efficiency, and task execution."}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetaCard label="Owner" value={detail.owner} />
              <MetaCard label="Team" value={detail.team} />
              <MetaCard label="Start" value={detail.startDate} />
              <MetaCard label="End" value={detail.endDate} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Budget Pacing</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{detail.budget}</h2>
              </div>
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-3">
              <MetaCard label="Spent" value={detail.totals.spend} compact />
              <MetaCard label="Budget utilization" value={`${detail.totals.budgetUtilization}%`} compact />
              <MetaCard label="Metric snapshots" value={String(detail.metricCount)} compact />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Participants" value={detail.totals.participants} />
        <MetricCard label="Cost per participant" value={detail.totals.cpp} />
        <MetricCard label="Cost per lead" value={detail.totals.cpl} />
        <MetricCard label="Cost per conversion" value={detail.totals.cpcv} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Funnel</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Campaign conversion path</h2>
            </div>
            <Funnel className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {detail.funnelSteps.map((step: { label: string; value: string; note: string }, index: number) => (
              <div key={step.label} className="rounded-[24px] bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{index + 1}. {step.label}</p>
                  <p className="text-lg font-bold text-slate-900">{step.value}</p>
                </div>
                <p className="text-sm leading-7 text-slate-500">{step.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Channel Breakdown</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Spend and outcome by channel</h2>
            </div>
            <ChartColumnIncreasing className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {detail.channelStats.map((item: { channel: string; spend: string; leads: string; participants: string; conversions: string; cpp: string }) => (
              <div key={item.channel} className="rounded-[24px] bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.channel}</p>
                  <Badge variant="outline">{item.cpp}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <MiniMetric label="Spend" value={item.spend} />
                  <MiniMetric label="Leads" value={item.leads} />
                  <MiniMetric label="Participants" value={item.participants} />
                  <MiniMetric label="Conversions" value={item.conversions} />
                  <MiniMetric label="CPP" value={item.cpp} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Linked Tasks</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Execution work tied to this campaign</h2>
            </div>
            <Badge variant="secondary">{detail.taskRows.length} tasks</Badge>
          </div>
          <div className="space-y-3">
            {detail.taskRows.length ? detail.taskRows.map((task: { id: string; title: string; status: string; dueDate: string | null; assignee: string; platform: string; priority: string }) => (
              <div key={task.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{task.assignee} · {task.platform}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{task.priority}</Badge>
                    <Badge variant="secondary">{task.status}</Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">Due: {task.dueDate ?? "No due date"}</p>
              </div>
            )) : (
              <div className="rounded-[24px] bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No tasks are linked to this campaign yet.
              </div>
            )}
          </div>
        </div>

        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Team Contribution</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Who is carrying campaign execution</h2>
            </div>
            <Badge variant="outline">Task contribution</Badge>
          </div>
          <div className="space-y-3">
            {detail.contributionRows.length ? detail.contributionRows.map((row: { person: string; role: string; tasks: number; completed: number; onTime: string }, index: number) => (
              <div key={`${row.person}-${index}`} className="rounded-[24px] bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.person}</p>
                    <p className="mt-1 text-xs text-slate-400">{row.role}</p>
                  </div>
                  <Badge variant="outline">{row.completed}/{row.tasks} completed</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label="Tasks" value={String(row.tasks)} />
                  <MiniMetric label="On-time" value={row.onTime} />
                </div>
              </div>
            )) : (
              <div className="rounded-[24px] bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No contribution data yet for this campaign.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="premium-card border-none p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function MetaCard({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={compact ? "rounded-[20px] bg-slate-50 px-4 py-4" : "rounded-[20px] bg-white/90 px-4 py-4 ring-1 ring-black/5"}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
