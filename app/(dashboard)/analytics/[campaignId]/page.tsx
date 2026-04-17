import { CampaignDetailView } from "@/components/analytics/campaign-detail-view";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  return (
    <div className="page-frame gap-8 py-8">
      <CampaignDetailView campaignId={campaignId} />
    </div>
  );
}
