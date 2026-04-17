import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  ChartColumnIncreasing,
  CircleDollarSign,
  FileSpreadsheet,
  Funnel,
  Megaphone,
  Target,
  Users2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  defaultCampaignRows,
  defaultChannelStats,
  defaultContributionRows,
  defaultDataIntakeItems,
  defaultFilterPills,
  defaultFunnelSteps,
  defaultInsights,
  defaultSpotlight,
  defaultSummaryCards,
} from "./analytics-defaults";
import { MiniMetric, SpotlightMetric, mapStatusVariant } from "./analytics-metrics";
import type { AnalyticsOverviewProps } from "./analytics-types";

export type { AnalyticsOverviewProps };

const cardIcons = [CircleDollarSign, Users2, BadgeDollarSign, Funnel];

export function AnalyticsOverview({
  summaryCards = defaultSummaryCards,
  campaignRows = defaultCampaignRows,
  channelStats = defaultChannelStats,
  funnelSteps = defaultFunnelSteps,
  insights = defaultInsights,
  contributionRows = defaultContributionRows,
  spotlight = defaultSpotlight,
  filterPills = defaultFilterPills,
  dataIntakeItems = defaultDataIntakeItems,
  actionBar,
}: AnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      <HeroSection dataIntakeItems={dataIntakeItems} actionBar={actionBar} />
      <SummaryCards cards={summaryCards} />
      <FilterPills pills={filterPills} />
      <CampaignSection campaignRows={campaignRows} spotlight={spotlight} insights={insights} />
      <ChartsSection funnelSteps={funnelSteps} channelStats={channelStats} />
      <ContributionSection contributionRows={contributionRows} />
    </div>
  );
}

function HeroSection({ dataIntakeItems, actionBar }: Pick<AnalyticsOverviewProps, "dataIntakeItems" | "actionBar">) {
  return (
    <section className="premium-card border-none bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.15),_transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-6 sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <Badge variant="outline" className="mb-4">Campaign analytics workspace</Badge>
          <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Track budget efficiency, participant growth, and channel quality without leaving the team workspace
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            This workspace is structured for campaign owners and operations leads to review spend pacing, compare channel output, and connect activity to marketing outcomes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Executive snapshot", "Campaign comparison", "Team KPI bridge"].map((label) => (
              <div key={label} className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-black/5">
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Data Intake</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">How this page should be fed</h3>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-primary"><FileSpreadsheet className="h-5 w-5" /></div>
          </div>
          <div className="space-y-3">
            {dataIntakeItems?.map((item) => (
              <div key={item.title} className="rounded-[20px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">{item.title}</div>
            ))}
          </div>
          {actionBar ? <div className="mt-4 flex flex-wrap gap-3">{actionBar}</div> : null}
        </div>
      </div>
    </section>
  );
}

function SummaryCards({ cards }: { cards: NonNullable<AnalyticsOverviewProps["summaryCards"]> }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = cardIcons[index] ?? CircleDollarSign;
        return (
          <div key={card.label} className="premium-card border-none p-5 sm:p-6">
            <div className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{card.label}</p>
              <div className="rounded-2xl bg-slate-50 p-3 text-primary"><Icon className="h-5 w-5" /></div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{card.value}</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{card.detail}</p>
          </div>
        );
      })}
    </section>
  );
}

function FilterPills({ pills }: { pills: string[] }) {
  return (
    <section className="premium-card border-none p-5">
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {pills.map((item, index) => (
          <div key={item} className={index === 0
            ? "shrink-0 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            : "shrink-0 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600"
          }>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function CampaignSection({ campaignRows, spotlight, insights }: Pick<AnalyticsOverviewProps, "campaignRows" | "spotlight" | "insights">) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
      <div className="premium-card border-none p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Campaign Performance</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Compare spend, participants, and efficiency by campaign</h2>
          </div>
          <Badge variant="outline">Overview table</Badge>
        </div>
        <div className="space-y-3 md:hidden">
          {campaignRows?.map((row) => (
            <div key={row.id ?? row.name} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {row.id ? <Link href={`/analytics/${row.id}`} className="font-semibold text-slate-900 hover:text-primary">{row.name}</Link> : <p className="font-semibold text-slate-900">{row.name}</p>}
                  <p className="mt-1 text-xs text-slate-400">Owner: {row.owner}</p>
                </div>
                <Badge variant={mapStatusVariant(row.status)}>{row.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label="Budget" value={row.budget} />
                <MiniMetric label="Spent" value={row.spent} />
                <MiniMetric label="Participants" value={row.participants} />
                <MiniMetric label="CPP" value={row.cpp} />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-[28px] border border-slate-200 md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[2.3fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-slate-50 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                <span>Campaign</span><span>Status</span><span>Owner</span><span>Budget</span><span>Spent</span><span>Participants</span><span>CPP</span>
              </div>
              {campaignRows?.map((row) => (
                <div key={row.id ?? row.name} className="grid grid-cols-[2.3fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
                  <div>
                    {row.id ? <Link href={`/analytics/${row.id}`} className="font-semibold text-slate-900 hover:text-primary">{row.name}</Link> : <p className="font-semibold text-slate-900">{row.name}</p>}
                    <p className="mt-1 text-xs text-slate-400">Tap in for granular campaign analytics</p>
                  </div>
                  <div><Badge variant={mapStatusVariant(row.status)}>{row.status}</Badge></div>
                  <span>{row.owner}</span><span>{row.budget}</span><span>{row.spent}</span><span>{row.participants}</span>
                  <span className="font-semibold text-slate-900">{row.cpp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <SpotlightCard spotlight={spotlight ?? null} />
        <InsightsCard insights={insights ?? []} />
      </div>
    </section>
  );
}

function SpotlightCard({ spotlight }: { spotlight: AnalyticsOverviewProps["spotlight"] }) {
  return (
    <div className="premium-card border-none p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Spotlight Campaign</p>
          <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">{spotlight?.name ?? "No campaign yet"}</h2>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><Target className="h-5 w-5" /></div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <SpotlightMetric label="Budget" value={spotlight?.budget ?? "RM 0"} />
        <SpotlightMetric label="Spent" value={spotlight?.spent ?? "RM 0"} />
        <SpotlightMetric label="Participants" value={spotlight?.participants ?? "0"} />
        <SpotlightMetric label="Cost / participant" value={spotlight?.cpp ?? "RM 0"} />
      </div>
      <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span>Budget Utilization</span><span>{spotlight?.budgetUtilization ?? 0}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, spotlight?.budgetUtilization ?? 0))}%` }} />
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {spotlight?.insight ?? "Create your first campaign and start logging metrics to unlock live performance commentary."}
        </p>
      </div>
    </div>
  );
}

function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <div className="premium-card border-none p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Quick Insights</p>
        <Megaphone className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-3">
        {insights.map((item) => (
          <div key={item} className="rounded-[24px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">{item}</div>
        ))}
      </div>
    </div>
  );
}

function ChartsSection({ funnelSteps, channelStats }: Pick<AnalyticsOverviewProps, "funnelSteps" | "channelStats">) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
      <div className="premium-card border-none p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Budget Rhythm</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">Spend versus participant growth by week</h2>
          </div>
          <ChartColumnIncreasing className="h-5 w-5 text-primary" />
        </div>
        <div className="rounded-[28px] bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f5_100%)] p-4 sm:p-5">
          <div className="flex h-48 items-end gap-2 sm:h-56 sm:gap-3">
            {[
              { spend: "h-24", participants: "h-16", label: "W1" },
              { spend: "h-28", participants: "h-20", label: "W2" },
              { spend: "h-40", participants: "h-32", label: "W3" },
              { spend: "h-48", participants: "h-40", label: "W4" },
              { spend: "h-36", participants: "h-44", label: "W5" },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex w-full items-end justify-center gap-2">
                  <div className={`w-4 rounded-t-full bg-slate-300 sm:w-5 ${bar.spend}`} />
                  <div className={`w-4 rounded-t-full bg-primary sm:w-5 ${bar.participants}`} />
                </div>
                <span className="text-xs font-semibold text-slate-400">{bar.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-5 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-300" />Spend</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" />Participants</div>
          </div>
        </div>
      </div>

      <div className="premium-card border-none p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Acquisition Funnel</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">From exposure to active participation</h2>
          </div>
          <Funnel className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-3">
          {funnelSteps?.map((step, index) => (
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Channel Efficiency</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">Which channels are earning the budget</h2>
          </div>
          <Badge variant="secondary">Spend mix</Badge>
        </div>
        <div className="space-y-3">
          {channelStats?.map((item) => (
            <div key={item.channel} className="rounded-[24px] bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{item.channel}</p>
                <Badge variant="outline">{item.share}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <MiniMetric label="Spend" value={item.spend} />
                <MiniMetric label="Participants" value={item.participants} />
                <MiniMetric label="CPP" value={item.cpp} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContributionSection({ contributionRows }: Pick<AnalyticsOverviewProps, "contributionRows">) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="premium-card border-none p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Team Contribution</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">Connect campaign output to team execution</h2>
          </div>
          <Badge variant="outline">Individual KPI bridge</Badge>
        </div>
        <div className="space-y-3 md:hidden">
          {contributionRows?.map((row) => (
            <div key={row.person} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{row.person}</p>
                  <p className="mt-1 text-xs text-slate-400">{row.role}</p>
                </div>
                <Badge variant="outline">{row.onTime} on-time</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label="Tasks" value={row.tasks} />
                <MiniMetric label="Campaigns" value={row.campaigns} />
                <MiniMetric label="On-time" value={row.onTime} />
                <MiniMetric label="Influenced" value={row.influenced} />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-[28px] border border-slate-200 md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr] bg-slate-50 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                <span>Name</span><span>Role</span><span>Tasks</span><span>On-time</span><span>Campaigns</span><span>Participants influenced</span>
              </div>
              {contributionRows?.map((row) => (
                <div key={row.person} className="grid grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr] items-center border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{row.person}</span>
                  <span>{row.role}</span><span>{row.tasks}</span><span>{row.onTime}</span><span>{row.campaigns}</span>
                  <span className="font-semibold text-slate-900">{row.influenced}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card border-none p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Drill-down Direction</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Recommended next detail page blocks</h2>
          </div>
          <ArrowRight className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-3">
          {[
            "Campaign header with owner, target KPI, dates, and budget pacing.",
            "Daily spend and participants chart with comparison toggle.",
            "Channel table for spend, leads, participants, and conversion rate.",
            "Content-level performance list for creatives, captions, and landing pages.",
            "Task execution health with blockers, delays, and approval turnaround.",
            "Actionable insights panel for what to scale, pause, or fix next.",
          ].map((item) => (
            <div key={item} className="rounded-[24px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">{item}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
