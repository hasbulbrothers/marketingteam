import type { ReactNode } from "react";
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

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

type CampaignRow = {
  id?: string;
  name: string;
  status: string;
  owner: string;
  budget: string;
  spent: string;
  participants: string;
  cpp: string;
};

type ChannelStat = {
  channel: string;
  spend: string;
  participants: string;
  cpp: string;
  share: string;
};

type FunnelStep = {
  label: string;
  value: string;
  note: string;
};

type ContributionRow = {
  person: string;
  role: string;
  tasks: string;
  onTime: string;
  campaigns: string;
  influenced: string;
};

type Spotlight = {
  name: string;
  budget: string;
  spent: string;
  participants: string;
  cpp: string;
  budgetUtilization: number;
  insight: string;
} | null;

type DataIntakeItem = {
  title: string;
};

export type AnalyticsOverviewProps = {
  summaryCards?: SummaryCard[];
  campaignRows?: CampaignRow[];
  channelStats?: ChannelStat[];
  funnelSteps?: FunnelStep[];
  insights?: string[];
  contributionRows?: ContributionRow[];
  spotlight?: Spotlight;
  filterPills?: string[];
  dataIntakeItems?: DataIntakeItem[];
  actionBar?: ReactNode;
};

const defaultSummaryCards: SummaryCard[] = [
  {
    label: "Total spend",
    value: "RM 48,900",
    detail: "Across 8 active campaigns in the last 30 days.",
  },
  {
    label: "Participants",
    value: "3,284",
    detail: "Combined registrations, sign-ups, and event participation.",
  },
  {
    label: "Cost per participant",
    value: "RM 14.89",
    detail: "Blended acquisition cost across paid and owned channels.",
  },
  {
    label: "Lead to participant",
    value: "38.4%",
    detail: "Average conversion rate from captured lead to active participant.",
  },
];

const defaultFilterPills = [
  "Last 30 days",
  "All campaigns",
  "All channels",
  "All teams",
  "All owners",
  "Compare vs previous",
];

const defaultCampaignRows: CampaignRow[] = [
  {
    name: "Roadshow Ramadan Push",
    status: "Active",
    owner: "Sarah",
    budget: "RM 18,000",
    spent: "RM 14,260",
    participants: "1,124",
    cpp: "RM 12.69",
  },
  {
    name: "Agent Referral Sprint",
    status: "Review",
    owner: "Hakim",
    budget: "RM 10,000",
    spent: "RM 8,430",
    participants: "486",
    cpp: "RM 17.35",
  },
  {
    name: "Open Day April Intake",
    status: "Active",
    owner: "Nadia",
    budget: "RM 12,500",
    spent: "RM 11,920",
    participants: "928",
    cpp: "RM 12.84",
  },
  {
    name: "WhatsApp Nurture Burst",
    status: "Planning",
    owner: "Iman",
    budget: "RM 5,000",
    spent: "RM 1,480",
    participants: "121",
    cpp: "RM 12.23",
  },
];

const defaultChannelStats: ChannelStat[] = [
  { channel: "Facebook Ads", spend: "RM 16,200", participants: "1,240", cpp: "RM 13.06", share: "42%" },
  { channel: "Instagram", spend: "RM 9,800", participants: "640", cpp: "RM 15.31", share: "26%" },
  { channel: "TikTok", spend: "RM 13,100", participants: "1,004", cpp: "RM 13.05", share: "28%" },
  { channel: "Email / CRM", spend: "RM 2,300", participants: "400", cpp: "RM 5.75", share: "4%" },
];

const defaultFunnelSteps: FunnelStep[] = [
  { label: "Reach", value: "182k", note: "Paid + organic campaign exposure" },
  { label: "Clicks", value: "14.6k", note: "Landing page and form intent" },
  { label: "Leads", value: "8,550", note: "Captured contact records" },
  { label: "Participants", value: "3,284", note: "Registered or attended" },
];

const defaultInsights = [
  "TikTok and Facebook currently share the best blended cost efficiency, but TikTok has stronger participant growth momentum.",
  "Email retargeting has the lowest cost per participant, which makes it a strong lever for remarketing and reminder sequences.",
  "Roadshow Ramadan Push is consuming budget fastest and should have a daily pacing monitor before the final week spike.",
];

const defaultContributionRows: ContributionRow[] = [
  { person: "Sarah", role: "Campaign Lead", tasks: "18", onTime: "94%", campaigns: "3", influenced: "1,420" },
  { person: "Aina", role: "Designer", tasks: "26", onTime: "88%", campaigns: "4", influenced: "980" },
  { person: "Hakim", role: "Media Buyer", tasks: "12", onTime: "92%", campaigns: "2", influenced: "1,104" },
  { person: "Nadia", role: "Content Manager", tasks: "21", onTime: "90%", campaigns: "3", influenced: "1,268" },
];

const defaultSpotlight: Spotlight = {
  name: "Open Day April Intake",
  budget: "RM 12,500",
  spent: "RM 11,920",
  participants: "928",
  cpp: "RM 12.84",
  budgetUtilization: 95,
  insight:
    "Strong participant volume with healthy conversion pacing, but very limited remaining budget for the final push.",
};

const defaultDataIntakeItems: DataIntakeItem[] = [
  { title: "Manual campaign form for budget, owner, dates, and objectives." },
  { title: "Daily or weekly metric entries for spend, leads, participants, and conversions." },
  { title: "Optional CSV import from Meta Ads, TikTok Ads, or CRM exports." },
];

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
      <section className="premium-card border-none bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.15),_transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <Badge variant="outline" className="mb-4">
              Campaign analytics workspace
            </Badge>
            <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Track budget efficiency, participant growth, and channel quality without leaving the team workspace
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              This workspace is structured for campaign owners, managers, and operations leads to review spend pacing, compare channel output, and connect activity to marketing outcomes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-black/5">
                Executive snapshot
              </div>
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-black/5">
                Campaign comparison
              </div>
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-black/5">
                Team KPI bridge
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Data Intake
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">How this page should be fed</h3>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-3">
              {dataIntakeItems.map((item) => (
                <div key={item.title} className="rounded-[20px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item.title}
                </div>
              ))}
            </div>
            {actionBar ? <div className="mt-4 flex flex-wrap gap-3">{actionBar}</div> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => {
          const Icon = cardIcons[index] ?? CircleDollarSign;
          return (
            <div key={card.label} className="premium-card border-none p-5 sm:p-6">
              <div className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    {card.label}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{card.value}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{card.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="premium-card border-none p-5">
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {filterPills.map((item, index) => (
            <div
              key={item}
              className={
                index === 0
                  ? "shrink-0 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                  : "shrink-0 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600"
              }
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Campaign Performance
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Compare spend, participants, and efficiency by campaign
              </h2>
            </div>
            <Badge variant="outline">Overview table</Badge>
          </div>
          <div className="space-y-3 md:hidden">
            {campaignRows.map((row) => (
              <div key={row.id ?? row.name} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {row.id ? (
                      <Link href={`/analytics/${row.id}`} className="font-semibold text-slate-900 hover:text-primary">
                        {row.name}
                      </Link>
                    ) : (
                      <p className="font-semibold text-slate-900">{row.name}</p>
                    )}
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
                  <span>Campaign</span>
                  <span>Status</span>
                  <span>Owner</span>
                  <span>Budget</span>
                  <span>Spent</span>
                  <span>Participants</span>
                  <span>CPP</span>
                </div>
                {campaignRows.map((row) => (
                  <div
                    key={row.id ?? row.name}
                    className="grid grid-cols-[2.3fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-slate-200 px-5 py-4 text-sm text-slate-600"
                  >
                    <div>
                      {row.id ? (
                        <Link href={`/analytics/${row.id}`} className="font-semibold text-slate-900 hover:text-primary">
                          {row.name}
                        </Link>
                      ) : (
                        <p className="font-semibold text-slate-900">{row.name}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">Tap in for granular campaign analytics</p>
                    </div>
                    <div>
                      <Badge variant={mapStatusVariant(row.status)}>{row.status}</Badge>
                    </div>
                    <span>{row.owner}</span>
                    <span>{row.budget}</span>
                    <span>{row.spent}</span>
                    <span>{row.participants}</span>
                    <span className="font-semibold text-slate-900">{row.cpp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="premium-card border-none p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Spotlight Campaign
                </p>
                <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                  {spotlight?.name ?? "No campaign yet"}
                </h2>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <SpotlightMetric label="Budget" value={spotlight?.budget ?? "RM 0"} />
              <SpotlightMetric label="Spent" value={spotlight?.spent ?? "RM 0"} />
              <SpotlightMetric label="Participants" value={spotlight?.participants ?? "0"} />
              <SpotlightMetric label="Cost / participant" value={spotlight?.cpp ?? "RM 0"} />
            </div>
            <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span>Budget Utilization</span>
                <span>{spotlight?.budgetUtilization ?? 0}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(0, Math.min(100, spotlight?.budgetUtilization ?? 0))}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {spotlight?.insight ?? "Create your first campaign and start logging metrics to unlock live performance commentary."}
              </p>
            </div>
          </div>

          <div className="premium-card border-none p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Quick Insights
                </p>
              </div>
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3">
              {insights.map((item) => (
                <div key={item} className="rounded-[24px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Budget Rhythm
              </p>
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
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                Spend
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary" />
                Participants
              </div>
            </div>
          </div>
        </div>

        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Acquisition Funnel
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">From exposure to active participation</h2>
            </div>
            <Funnel className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {funnelSteps.map((step, index) => (
              <div key={step.label} className="rounded-[24px] bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {index + 1}. {step.label}
                  </p>
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
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Channel Efficiency
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">Which channels are earning the budget</h2>
            </div>
            <Badge variant="secondary">Spend mix</Badge>
          </div>
          <div className="space-y-3">
            {channelStats.map((item) => (
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

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="premium-card border-none p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Team Contribution
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">Connect campaign output to team execution</h2>
            </div>
            <Badge variant="outline">Individual KPI bridge</Badge>
          </div>
          <div className="space-y-3 md:hidden">
            {contributionRows.map((row) => (
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
                  <span>Name</span>
                  <span>Role</span>
                  <span>Tasks</span>
                  <span>On-time</span>
                  <span>Campaigns</span>
                  <span>Participants influenced</span>
                </div>
                {contributionRows.map((row) => (
                  <div
                    key={row.person}
                    className="grid grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr] items-center border-t border-slate-200 px-5 py-4 text-sm text-slate-600"
                  >
                    <span className="font-semibold text-slate-900">{row.person}</span>
                    <span>{row.role}</span>
                    <span>{row.tasks}</span>
                    <span>{row.onTime}</span>
                    <span>{row.campaigns}</span>
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
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Drill-down Direction
              </p>
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
              <div key={item} className="rounded-[24px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function mapStatusVariant(status: string): "default" | "secondary" | "outline" {
  const normalized = status.toLowerCase();
  if (normalized === "active") return "default";
  if (normalized === "review") return "secondary";
  return "outline";
}

function SpotlightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-slate-50 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-bold text-slate-900 sm:text-lg">{value}</p>
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
