"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Pencil, Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { KPI_METRICS, KPI_PERIODS, KPI_PLATFORMS } from "./kpi-labels";
import type { KpiTargetView, TeamOption, UserOption } from "./kpi-types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

export function KpiDialog({
  mode, kpi, teamOptions, userOptions,
}: {
  mode: "create" | "edit";
  kpi?: KpiTargetView;
  teamOptions: TeamOption[];
  userOptions: UserOption[];
}) {
  const createKpi = useMutation(api.kpi.mutations.createKpiTarget);
  const updateKpi = useMutation(api.kpi.mutations.updateKpiTarget);

  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"team" | "user">(kpi?.scope ?? "team");
  const [teamId, setTeamId] = useState(kpi?.teamId ?? "");
  const [userId, setUserId] = useState(kpi?.userId ?? "");
  const [metric, setMetric] = useState(kpi?.metric ?? "tasks_completed");
  const [target, setTarget] = useState<string>(kpi ? String(kpi.target) : "10");
  const [period, setPeriod] = useState(kpi?.period ?? "monthly");
  const [startDate, setStartDate] = useState(kpi?.startDate ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(kpi?.endDate ?? new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  const [platform, setPlatform] = useState(kpi?.platform ?? "");
  const [label, setLabel] = useState(kpi?.label ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = Number(target);
    if (!Number.isFinite(targetNum) || targetNum <= 0) { alert("Target must be a positive number."); return; }

    setSubmitting(true);
    try {
      if (mode === "create") {
        if (scope === "team" && !teamId) { alert("Please select a team."); setSubmitting(false); return; }
        if (scope === "user" && !userId) { alert("Please select a user."); setSubmitting(false); return; }
        await createKpi({
          scope,
          teamId: scope === "team" ? (teamId as Id<"teams">) : undefined,
          userId: scope === "user" ? (userId as Id<"users">) : undefined,
          metric: metric as "tasks_completed" | "tasks_on_time" | "posts_published" | "average_lead_time_days",
          target: targetNum,
          period: period as "weekly" | "monthly" | "quarterly",
          startDate, endDate,
          platform: platform ? (platform as (typeof KPI_PLATFORMS)[number]) : undefined,
          label: label.trim() || undefined,
        });
      } else if (kpi) {
        await updateKpi({
          kpiId: kpi.id as Id<"kpiTargets">,
          target: targetNum, startDate, endDate,
          platform: platform ? (platform as (typeof KPI_PLATFORMS)[number]) : undefined,
          label: label.trim() || undefined,
        });
      }
      setOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save KPI");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "create" ? (
        <DialogTrigger render={<Button size="sm" className="gap-2" />}><Plus className="h-4 w-4" />New KPI</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Edit KPI" />}><Pencil className="h-4 w-4" /></DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New KPI target" : "Edit KPI target"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setScope("team")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${scope === "team" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>
                  Team
                </button>
                <button type="button" onClick={() => setScope("user")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${scope === "user" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500"}`}>
                  Individual
                </button>
              </div>

              {scope === "team" ? (
                <Field label="Team">
                  <select value={teamId} onChange={(e) => setTeamId(e.target.value)} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select team</option>
                    {teamOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </Field>
              ) : (
                <Field label="User">
                  <select value={userId} onChange={(e) => setUserId(e.target.value)} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select user</option>
                    {userOptions.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </Field>
              )}

              <Field label="Metric">
                <select value={metric} onChange={(e) => setMetric(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {KPI_METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>

              <Field label="Period">
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {KPI_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target"><Input type="number" min="1" step="1" value={target} onChange={(e) => setTarget(e.target.value)} required /></Field>
            <Field label="Platform (optional)">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All platforms</option>
                {KPI_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></Field>
            <Field label="End date"><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></Field>
          </div>

          <Field label="Label (optional)"><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Q2 launch push" /></Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : mode === "create" ? "Create KPI" : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
