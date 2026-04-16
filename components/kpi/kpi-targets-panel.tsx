"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CurrentUserProfile } from "@/types/user";
import {
  KPI_METRICS,
  KPI_PERIODS,
  KPI_PLATFORMS,
  metricLabel,
  metricUnit,
} from "./kpi-labels";

type KpiTargetView = {
  id: string;
  scope: "team" | "user";
  teamId: string | null;
  userId: string | null;
  teamName: string | null;
  userName: string | null;
  metric: string;
  target: number;
  actual: number;
  progress: number;
  achieved: boolean;
  period: string;
  startDate: string;
  endDate: string;
  platform: string | null;
  label: string | null;
  isActive: boolean;
};

type TeamOption = { id: string; name: string };
type UserOption = { id: string; name: string };

export function KpiTargetsPanel() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const currentUser = useQuery(
    api.users.queries.getCurrentUser,
    isAuthed ? {} : "skip",
  ) as CurrentUserProfile | null | undefined;

  const canManage =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const kpis = useQuery(
    api.kpi.queries.listKpiTargets,
    isAuthed ? {} : "skip",
  ) as KpiTargetView[] | undefined;

  const teams = useQuery(
    api.teams.queries.listTeams,
    isAuthed ? {} : "skip",
  ) as { id: string; name: string }[] | undefined;

  const users = useQuery(
    api.users.queries.getUsers,
    isAuthed ? {} : "skip",
  ) as { _id: Id<"users">; name: string }[] | undefined;

  const teamOptions: TeamOption[] = (teams ?? []).map((t) => ({
    id: t.id,
    name: t.name,
  }));
  const userOptions: UserOption[] = (users ?? []).map((u) => ({
    id: String(u._id),
    name: u.name,
  }));

  const achievedCount = useMemo(
    () => (kpis ?? []).filter((k) => k.achieved).length,
    [kpis],
  );

  if (!currentUser) return null;

  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">
            KPI targets
          </CardTitle>
          <p className="text-sm text-slate-400">
            Track what each team or member needs to deliver each period.
            {kpis && kpis.length > 0 && (
              <>
                {" "}
                <span className="font-semibold text-slate-600">
                  {achievedCount}/{kpis.length}
                </span>{" "}
                on track.
              </>
            )}
          </p>
        </div>
        {canManage && (
          <KpiDialog
            mode="create"
            teamOptions={teamOptions}
            userOptions={userOptions}
          />
        )}
      </CardHeader>
      <CardContent className="mt-6 p-0">
        {!kpis ? (
          <p className="text-sm text-slate-400">Loading KPIs…</p>
        ) : kpis.length === 0 ? (
          <div className="rounded-[24px] bg-background px-6 py-10 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No KPI targets yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Set a target to measure what the team needs to deliver.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                kpi={kpi}
                canManage={canManage}
                teamOptions={teamOptions}
                userOptions={userOptions}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KpiCard({
  kpi,
  canManage,
  teamOptions,
  userOptions,
}: {
  kpi: KpiTargetView;
  canManage: boolean;
  teamOptions: TeamOption[];
  userOptions: UserOption[];
}) {
  const deleteKpi = useMutation(api.kpi.mutations.deleteKpiTarget);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this KPI target?")) return;
    setBusy(true);
    try {
      await deleteKpi({ kpiId: kpi.id as Id<"kpiTargets"> });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete KPI");
    } finally {
      setBusy(false);
    }
  };

  const unit = metricUnit(kpi.metric);
  const subject = kpi.scope === "team" ? kpi.teamName : kpi.userName;

  return (
    <div className="rounded-[24px] bg-background px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide ${
                kpi.scope === "team"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {kpi.scope}
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">
              {subject ?? "Unassigned"}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {metricLabel(kpi.metric)}
            {kpi.platform && (
              <span className="ml-1 text-slate-400">· {kpi.platform}</span>
            )}
            {kpi.label && (
              <span className="ml-1 text-slate-400">· {kpi.label}</span>
            )}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-1">
            <KpiDialog
              mode="edit"
              kpi={kpi}
              teamOptions={teamOptions}
              userOptions={userOptions}
            />
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Delete KPI"
              onClick={handleDelete}
              disabled={busy}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-400">Actual</p>
          <p className="text-lg font-bold text-slate-900">
            {kpi.actual} <span className="text-xs text-slate-400">{unit}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Target</p>
          <p className="text-sm font-semibold text-slate-700">
            {kpi.target} {unit}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-500">
            {kpi.achieved && (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            )}
            {kpi.progress}% progress
          </span>
          <span className="text-slate-400">
            {kpi.startDate} → {kpi.endDate}
          </span>
        </div>
        <Progress
          className="h-2 bg-slate-100"
          value={Math.min(100, kpi.progress)}
        />
      </div>
    </div>
  );
}

function KpiDialog({
  mode,
  kpi,
  teamOptions,
  userOptions,
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
  const [target, setTarget] = useState<string>(
    kpi ? String(kpi.target) : "10",
  );
  const [period, setPeriod] = useState(kpi?.period ?? "monthly");
  const [startDate, setStartDate] = useState(
    kpi?.startDate ?? new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(
    kpi?.endDate ??
      new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
  );
  const [platform, setPlatform] = useState(kpi?.platform ?? "");
  const [label, setLabel] = useState(kpi?.label ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = Number(target);
    if (!Number.isFinite(targetNum) || targetNum <= 0) {
      alert("Target must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        if (scope === "team" && !teamId) {
          alert("Please select a team.");
          setSubmitting(false);
          return;
        }
        if (scope === "user" && !userId) {
          alert("Please select a user.");
          setSubmitting(false);
          return;
        }
        await createKpi({
          scope,
          teamId:
            scope === "team" ? (teamId as Id<"teams">) : undefined,
          userId:
            scope === "user" ? (userId as Id<"users">) : undefined,
          metric: metric as
            | "tasks_completed"
            | "tasks_on_time"
            | "posts_published"
            | "average_lead_time_days",
          target: targetNum,
          period: period as "weekly" | "monthly" | "quarterly",
          startDate,
          endDate,
          platform: platform
            ? (platform as (typeof KPI_PLATFORMS)[number])
            : undefined,
          label: label.trim() || undefined,
        });
      } else if (kpi) {
        await updateKpi({
          kpiId: kpi.id as Id<"kpiTargets">,
          target: targetNum,
          startDate,
          endDate,
          platform: platform
            ? (platform as (typeof KPI_PLATFORMS)[number])
            : undefined,
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
        <DialogTrigger render={<Button size="sm" className="gap-2" />}>
          <Plus className="h-4 w-4" />
          New KPI
        </DialogTrigger>
      ) : (
        <DialogTrigger
          render={
            <Button size="icon-sm" variant="ghost" aria-label="Edit KPI" />
          }
        >
          <Pencil className="h-4 w-4" />
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New KPI target" : "Edit KPI target"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope("team")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    scope === "team"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  Team
                </button>
                <button
                  type="button"
                  onClick={() => setScope("user")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    scope === "user"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  Individual
                </button>
              </div>

              {scope === "team" ? (
                <Field label="Team">
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select team</option>
                    {teamOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="User">
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select user</option>
                    {userOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Metric">
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {KPI_METRICS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Period">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {KPI_PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target">
              <Input
                type="number"
                min="1"
                step="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </Field>
            <Field label="Platform (optional)">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All platforms</option>
                {KPI_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Label (optional)">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Q2 launch push"
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving…"
                : mode === "create"
                  ? "Create KPI"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
