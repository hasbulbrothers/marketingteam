"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { metricLabel, metricUnit } from "./kpi-labels";
import { KpiDialog } from "./kpi-dialog";
import type { KpiTargetView, TeamOption, UserOption } from "./kpi-types";

export function KpiCard({
  kpi, canManage, teamOptions, userOptions,
}: {
  kpi: KpiTargetView; canManage: boolean;
  teamOptions: TeamOption[]; userOptions: UserOption[];
}) {
  const deleteKpi = useMutation(api.kpi.mutations.deleteKpiTarget);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this KPI target?")) return;
    setBusy(true);
    try { await deleteKpi({ kpiId: kpi.id as Id<"kpiTargets"> }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to delete KPI"); }
    finally { setBusy(false); }
  };

  const unit = metricUnit(kpi.metric);
  const subject = kpi.scope === "team" ? kpi.teamName : kpi.userName;

  return (
    <div className="rounded-[24px] bg-background px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide ${
              kpi.scope === "team" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
            }`}>
              {kpi.scope}
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">{subject ?? "Unassigned"}</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {metricLabel(kpi.metric)}
            {kpi.platform && <span className="ml-1 text-slate-400">· {kpi.platform}</span>}
            {kpi.label && <span className="ml-1 text-slate-400">· {kpi.label}</span>}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-1">
            <KpiDialog mode="edit" kpi={kpi} teamOptions={teamOptions} userOptions={userOptions} />
            <Button size="icon-sm" variant="ghost" aria-label="Delete KPI" onClick={handleDelete} disabled={busy}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        {kpi.metric === "tasks_completed" ? (
          <div>
            <p className="text-xs text-slate-400">Subtask progress</p>
            <p className="text-lg font-bold text-slate-900">{kpi.actual}%</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-slate-400">Actual</p>
              <p className="text-lg font-bold text-slate-900">{kpi.actual} <span className="text-xs text-slate-400">{unit}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Target</p>
              <p className="text-sm font-semibold text-slate-700">{kpi.target} {unit}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-500">
            {kpi.achieved && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
            {kpi.progress}% progress
          </span>
          <span className="text-slate-400">{kpi.startDate} → {kpi.endDate}</span>
        </div>
        <Progress className="h-2 bg-slate-100" value={Math.min(100, kpi.progress)} />
      </div>
    </div>
  );
}
