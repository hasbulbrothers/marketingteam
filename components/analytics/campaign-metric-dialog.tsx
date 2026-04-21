"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const channels = [
  "TikTok",
  "Instagram",
  "Facebook",
  "Threads",
  "YouTube",
  "Email",
  "Website",
] as const;

type CampaignChannel = (typeof channels)[number];

const initialState = {
  campaignId: "",
  date: "",
  channel: "Facebook" as CampaignChannel,
  spend: "",
  reach: "",
  clicks: "",
  leads: "",
  participants: "",
  conversions: "",
};

export function CampaignMetricDialog({
  open,
  onOpenChange,
  campaigns,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: Array<{ id: string; name: string }>;
  onCreate: (payload: {
    campaignId: string;
    date: string;
    channel: CampaignChannel;
    spend: number;
    reach: number;
    clicks: number;
    leads: number;
    participants: number;
    conversions: number;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.campaignId || !form.date) return;

    setSubmitting(true);
    try {
      await onCreate({
        campaignId: form.campaignId,
        date: form.date,
        channel: form.channel,
        spend: Math.max(0, Number(form.spend) || 0),
        reach: Math.max(0, Number(form.reach) || 0),
        clicks: Math.max(0, Number(form.clicks) || 0),
        leads: Math.max(0, Number(form.leads) || 0),
        participants: Math.max(0, Number(form.participants) || 0),
        conversions: Math.max(0, Number(form.conversions) || 0),
      });
      setForm(initialState);
      onOpenChange(false);
      toast.success("Metrics saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan metrik.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] border-none bg-white sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">Log campaign metrics</DialogTitle>
          <DialogDescription className="text-sm leading-7 text-slate-500">
            Add a daily or weekly snapshot for spend, participants, and conversion-related outcomes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <NativeSelect value={form.campaignId} onChange={(value) => update("campaignId", value)} options={campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }))} placeholder="Select campaign" />
          <NativeSelect value={form.channel} onChange={(value) => update("channel", value as CampaignChannel)} options={channels.map((channel) => ({ value: channel, label: channel }))} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="number" min="0" placeholder="Spend (RM)" value={form.spend} onChange={(event) => update("spend", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="number" min="0" placeholder="Reach" value={form.reach} onChange={(event) => update("reach", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="number" min="0" placeholder="Clicks" value={form.clicks} onChange={(event) => update("clicks", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="number" min="0" placeholder="Leads" value={form.leads} onChange={(event) => update("leads", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="number" min="0" placeholder="Participants" value={form.participants} onChange={(event) => update("participants", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm md:col-span-2" type="number" min="0" placeholder="Conversions" value={form.conversions} onChange={(event) => update("conversions", event.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-600" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Saving..." : "Save metrics"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <select className="h-12 rounded-2xl border-none bg-background px-4 text-sm text-slate-600 shadow-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}
