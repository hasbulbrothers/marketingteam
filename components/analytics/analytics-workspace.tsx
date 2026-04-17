"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Plus, TrendingUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { CampaignCreateDialog } from "@/components/analytics/campaign-create-dialog";
import { CampaignMetricDialog } from "@/components/analytics/campaign-metric-dialog";
import { Button } from "@/components/ui/button";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AnalyticsWorkspace({ preview = false }: { preview?: boolean }) {
  if (preview || !hasClerk) {
    return <PreviewAnalyticsWorkspace />;
  }

  return <LiveAnalyticsWorkspace />;
}

function PreviewAnalyticsWorkspace() {
  return (
    <AnalyticsOverview
      dataIntakeItems={[
        {
          title: "Connect Clerk and Convex to create campaigns with live ownership and permissions.",
        },
        {
          title: "Once connected, you can log campaign metrics manually and replace the placeholder data here.",
        },
        {
          title: "CSV import can be added later for Meta Ads, TikTok Ads, CRM, or spreadsheet exports.",
        },
      ]}
      actionBar={
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Live input actions will appear here when authenticated analytics data is available.
        </div>
      }
    />
  );
}

function LiveAnalyticsWorkspace() {
  const { isLoaded, userId } = useAuth();
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [metricOpen, setMetricOpen] = useState(false);
  const isAuthed = Boolean(isLoaded && userId);
  const liveEnabled = isAuthed;

  const overview = useQuery(
    api.campaigns.queries.getAnalyticsOverview,
    liveEnabled ? {} : "skip",
  );
  const campaigns = useQuery(api.campaigns.queries.listCampaigns, liveEnabled ? {} : "skip");
  const users = useQuery(api.users.queries.getUsers, liveEnabled ? {} : "skip");
  const teams = useQuery(api.teams.queries.listTeams, liveEnabled ? { includeInactive: false } : "skip");

  const createCampaign = useMutation(api.campaigns.mutations.createCampaign);
  const createMetric = useMutation(api.campaigns.mutations.createCampaignMetric);

  return (
    <>
      <AnalyticsOverview
        summaryCards={overview?.summaryCards}
        campaignRows={overview?.campaignRows}
        channelStats={overview?.channelStats}
        funnelSteps={overview?.funnelSteps}
        insights={overview?.insights}
        contributionRows={overview?.contributionRows}
        spotlight={overview?.spotlight}
        dataIntakeItems={[
          {
            title: liveEnabled
              ? "Create campaigns manually with owner, budget, dates, and objectives."
              : "Connect Clerk and Convex to create campaigns with live ownership and permissions.",
          },
          {
            title: liveEnabled
              ? "Log daily or weekly spend, leads, participants, and conversions by channel."
              : "Once connected, you can log campaign metrics manually and replace the placeholder data here.",
          },
          {
            title: "CSV import can be added later for Meta Ads, TikTok Ads, CRM, or spreadsheet exports.",
          },
        ]}
        actionBar={
          liveEnabled ? (
            <>
              <Button className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95" onClick={() => setCampaignOpen(true)}>
                <Plus className="h-4 w-4" />
                Create campaign
              </Button>
              <Button variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-700" onClick={() => setMetricOpen(true)}>
                <TrendingUp className="h-4 w-4" />
                Log metrics
              </Button>
            </>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Live input actions will appear here when authenticated analytics data is available.
            </div>
          )
        }
      />

      <CampaignCreateDialog
        open={campaignOpen}
        onOpenChange={setCampaignOpen}
        owners={(users ?? []).map((user) => ({ id: String(user._id), name: user.name }))}
        teams={(teams ?? []).map((team) => ({ id: team.id, name: team.name }))}
        onCreate={async (payload) => {
          await createCampaign(payload as never);
        }}
      />

      <CampaignMetricDialog
        open={metricOpen}
        onOpenChange={setMetricOpen}
        campaigns={(campaigns ?? []).map((campaign) => ({ id: campaign.id, name: campaign.name }))}
        onCreate={async (payload) => {
          await createMetric(payload as never);
        }}
      />
    </>
  );
}
