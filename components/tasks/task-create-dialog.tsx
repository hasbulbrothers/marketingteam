"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_TYPES } from "@/lib/constants/content-types";
import { PLATFORMS } from "@/lib/constants/platforms";
import { TASK_PRIORITIES } from "@/lib/constants/task-priority";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { CampaignSummary } from "@/types/campaign";
import { MarketingTask } from "@/types/task";
import { TeamMember } from "@/types/user";

const initialState = {
  title: "",
  description: "",
  dueDate: "",
  platform: PLATFORMS[0],
  contentType: CONTENT_TYPES[0],
  priority: TASK_PRIORITIES[1],
  status: TASK_STATUSES[0].value,
  assigneeId: "",
  campaignId: "",
  tags: "",
};

export function TaskCreateDialog({
  open,
  onOpenChange,
  assignees,
  onCreate,
  presetDueDate,
  campaigns = [],
  presetCampaignId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignees: TeamMember[];
  onCreate: (task: MarketingTask) => void;
  presetDueDate?: string;
  campaigns?: CampaignSummary[];
  presetCampaignId?: string;
}) {
  const [form, setForm] = useState({
    ...initialState,
    dueDate: presetDueDate ?? "",
    campaignId: presetCampaignId ?? "",
  });

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const assignee = assignees.find((item) => item.id === form.assigneeId) ?? assignees[0];
    if (!assignee || !form.title.trim() || !form.description.trim() || !form.dueDate) return;
    onCreate({
      id: `task-${crypto.randomUUID()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      platform: form.platform,
      contentType: form.contentType,
      priority: form.priority,
      status: form.status,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      assignee: { id: assignee.id, name: assignee.name, role: assignee.role },
      campaign: campaigns.find((campaign) => campaign.id === form.campaignId) ?? null,
    });
    setForm(initialState);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] border-none bg-white sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">Create a marketing task</DialogTitle>
          <DialogDescription className="text-sm leading-7 text-slate-500">Capture the task once, then move it through planning, production, review, scheduling, and publishing.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" placeholder="Task title" value={form.title} onChange={(event) => update("title", event.target.value)} />
          <Select value={form.assigneeId} onChange={(value) => update("assigneeId", value)} options={assignees.map((assignee) => ({ value: assignee.id, label: assignee.name }))} placeholder="Select assignee" />
          <Select value={form.campaignId} onChange={(value) => update("campaignId", value)} options={campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }))} placeholder="Optional campaign" />
          <Select value={form.platform} onChange={(value) => update("platform", value as MarketingTask["platform"])} options={PLATFORMS.map((platform) => ({ value: platform, label: platform }))} />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm" type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} />
          <Select value={form.priority} onChange={(value) => update("priority", value as MarketingTask["priority"])} options={TASK_PRIORITIES.map((priority) => ({ value: priority, label: priority }))} />
          <Select value={form.contentType} onChange={(value) => update("contentType", value as MarketingTask["contentType"])} options={CONTENT_TYPES.map((type) => ({ value: type, label: type }))} />
          <Select value={form.status} onChange={(value) => update("status", value as MarketingTask["status"])} options={TASK_STATUSES.map((status) => ({ value: status.value, label: status.label }))} className="md:col-span-2" />
          <Input className="h-12 rounded-2xl border-none bg-background shadow-sm md:col-span-2" placeholder="Tags, separated by commas" value={form.tags} onChange={(event) => update("tags", event.target.value)} />
          <div className="md:col-span-2">
            <Textarea className="min-h-32 rounded-[24px] border-none bg-background shadow-sm" placeholder="Brief, deliverables, feedback notes, or publishing context" value={form.description} onChange={(event) => update("description", event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-600" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95" onClick={handleSave}>Save draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Select({ value, onChange, options, placeholder = "Select option", className = "" }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; placeholder?: string; className?: string; }) {
  return (
    <select className={`h-12 rounded-2xl border-none bg-background px-4 text-sm text-slate-600 shadow-sm outline-none ${className}`} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}
