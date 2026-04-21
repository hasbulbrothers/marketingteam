"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const campaignStatuses = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
] as const;

type CampaignStatus = (typeof campaignStatuses)[number]["value"];

const initialState = {
  name: "",
  objective: "",
  description: "",
  ownerId: "",
  teamId: "",
  budget: "",
  startDate: "",
  endDate: "",
  status: "planning" as CampaignStatus,
};

export function CampaignCreateDialog({
  open,
  onOpenChange,
  owners,
  teams,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owners: Array<{ id: string; name: string }>;
  teams: Array<{ id: string; name: string }>;
  onCreate: (payload: {
    name: string;
    objective: string;
    description?: string;
    ownerId: string;
    teamId?: string;
    budget: number;
    startDate: string;
    endDate: string;
    status: CampaignStatus;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.objective.trim() || !form.ownerId || !form.startDate || !form.endDate) {
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        name: form.name.trim(),
        objective: form.objective.trim(),
        description: form.description.trim() || undefined,
        ownerId: form.ownerId,
        teamId: form.teamId || undefined,
        budget: Number(form.budget || 0),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      });
      setForm(initialState);
      onOpenChange(false);
      toast.success("Campaign created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] border-none bg-white sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">Create campaign</DialogTitle>
          <DialogDescription className="text-sm leading-7 text-slate-500">
            Add the base campaign profile first, then log spend and outcome metrics over time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm md:col-span-2" placeholder="Campaign name" value={form.name} onChange={(event) => update("name", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm md:col-span-2" placeholder="Objective" value={form.objective} onChange={(event) => update("objective", event.target.value)} />
          <NativeSelect value={form.ownerId} onChange={(value) => update("ownerId", value)} options={owners.map((owner) => ({ value: owner.id, label: owner.name }))} placeholder="Select owner" />
          <NativeSelect value={form.teamId} onChange={(value) => update("teamId", value)} options={teams.map((team) => ({ value: team.id, label: team.name }))} placeholder="Optional team" />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="number" min="0" placeholder="Budget (RM)" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
          <NativeSelect value={form.status} onChange={(value) => update("status", value as CampaignStatus)} options={campaignStatuses.map((item) => ({ value: item.value, label: item.label }))} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="date" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} />
          <div className="md:col-span-2">
            <Textarea className="min-h-28 rounded-[24px] border-none bg-background shadow-sm" placeholder="Campaign description, angle, offer, or execution notes" value={form.description} onChange={(event) => update("description", event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-600" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Saving..." : "Create campaign"}
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
