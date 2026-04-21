"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CheckSquare, Target, TrendingUp, Trophy, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { metricLabel, metricUnit } from "./kpi-labels";

type SubtaskUserProgress = {
  userId: string;
  userName: string;
  teamId: string | null;
  totalSubtasks: number;
  completedSubtasks: number;
  progress: number;
  taskCount: number;
};

type KpiView = {
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
};

export function KpiOverview() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);

  const kpis = useQuery(
    api.kpi.queries.listKpiTargets,
    isAuthed ? {} : "skip",
  ) as KpiView[] | undefined;

  const subtaskProgress = useQuery(
    api.kpi.queries.getSubtaskProgress,
    isAuthed ? {} : "skip",
  ) as SubtaskUserProgress[] | undefined;

  const summary = useMemo(() => {
    const list = kpis ?? [];
    const total = list.length;
    const achieved = list.filter((k) => k.achieved).length;
    const avgProgress =
      total > 0
        ? Math.round(list.reduce((s, k) => s + k.progress, 0) / total)
        : 0;
    const teamsInvolved = new Set(
      list.filter((k) => k.scope === "team" && k.teamId).map((k) => k.teamId),
    ).size;
    return { total, achieved, avgProgress, teamsInvolved };
  }, [kpis]);

  const byTeam = useMemo(() => {
    const groups = new Map<
      string,
      { teamName: string; items: KpiView[] }
    >();
    for (const kpi of kpis ?? []) {
      if (kpi.scope !== "team" || !kpi.teamId) continue;
      const existing = groups.get(kpi.teamId);
      if (existing) {
        existing.items.push(kpi);
      } else {
        groups.set(kpi.teamId, {
          teamName: kpi.teamName ?? "Unnamed team",
          items: [kpi],
        });
      }
    }
    return Array.from(groups.entries()).map(([teamId, data]) => {
      const avg =
        data.items.length > 0
          ? Math.round(
              data.items.reduce((s, k) => s + k.progress, 0) /
                data.items.length,
            )
          : 0;
      const achieved = data.items.filter((k) => k.achieved).length;
      return {
        teamId,
        teamName: data.teamName,
        count: data.items.length,
        achieved,
        avgProgress: avg,
        items: data.items,
      };
    });
  }, [kpis]);

  const individuals = useMemo(
    () => (kpis ?? []).filter((k) => k.scope === "user"),
    [kpis],
  );

  if (!kpis) {
    return <p className="text-sm text-slate-400">Loading reports…</p>;
  }

  if (kpis.length === 0) {
    return (
      <Card className="premium-card border-none p-8">
        <CardContent className="p-0 text-center">
          <Target className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No KPIs to report yet
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Head to the Team page to set the first KPI target.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          icon={<Target className="h-4 w-4" />}
          label="Active KPIs"
          value={String(summary.total)}
        />
        <SummaryCard
          icon={<Trophy className="h-4 w-4" />}
          label="On track"
          value={`${summary.achieved}/${summary.total}`}
        />
        <SummaryCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg. progress"
          value={`${summary.avgProgress}%`}
        />
        <SummaryCard
          icon={<Users className="h-4 w-4" />}
          label="Teams tracked"
          value={String(summary.teamsInvolved)}
        />
      </section>

      {byTeam.length > 0 && (
        <Card className="premium-card border-none p-8">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold text-slate-900">
              Team KPI achievement
            </CardTitle>
            <p className="text-sm text-slate-400">
              Average progress across all active team targets in the current
              period.
            </p>
          </CardHeader>
          <CardContent className="mt-6 space-y-3 p-0">
            {byTeam
              .sort((a, b) => b.avgProgress - a.avgProgress)
              .map((team) => (
                <div
                  key={team.teamId}
                  className="rounded-[24px] bg-background px-5 py-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[1.5fr_0.7fr_0.7fr_1.3fr] lg:items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {team.teamName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {team.count} KPI{team.count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Metric
                      label="Achieved"
                      value={`${team.achieved}/${team.count}`}
                    />
                    <Metric
                      label="Avg. progress"
                      value={`${team.avgProgress}%`}
                    />
                    <div className="space-y-2">
                      <Progress
                        className="h-2 bg-slate-100"
                        value={Math.min(100, team.avgProgress)}
                      />
                      <p className="text-xs text-slate-400">
                        {team.items
                          .map(
                            (k) =>
                              `${metricLabel(k.metric)} ${k.actual}/${k.target}`,
                          )
                          .join(" · ")}
                      </p>
                      {(() => {
                        const teamMembers = (subtaskProgress ?? []).filter((u) => u.teamId === team.teamId);
                        const total = teamMembers.reduce((s, m) => s + m.totalSubtasks, 0);
                        const done = teamMembers.reduce((s, m) => s + m.completedSubtasks, 0);
                        if (total === 0) return null;
                        const pct = Math.round((done / total) * 100);
                        return (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3" /> Subtasks</span>
                              <span>{done}/{total} ({pct}%)</span>
                            </div>
                            <Progress className="h-1.5 bg-emerald-50" value={Math.min(100, pct)} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {individuals.length > 0 && (
        <Card className="premium-card border-none p-8">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold text-slate-900">
              Individual KPIs
            </CardTitle>
            <p className="text-sm text-slate-400">
              Personal targets assigned directly to team members.
            </p>
          </CardHeader>
          <CardContent className="mt-6 space-y-2 p-0">
            {individuals
              .sort((a, b) => b.progress - a.progress)
              .map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-4 rounded-[20px] bg-background px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {k.userName ?? "Unassigned"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {metricLabel(k.metric)}
                      {k.platform ? ` · ${k.platform}` : ""}
                    </p>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {k.actual}/{k.target} {metricUnit(k.metric)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {k.progress}% progress
                    </p>
                  </div>
                  <div className="hidden w-40 md:block">
                    <Progress
                      className="h-2 bg-slate-100"
                      value={Math.min(100, k.progress)}
                    />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {subtaskProgress && subtaskProgress.length > 0 && (
        <Card className="premium-card border-none p-8">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              Subtask progress
            </CardTitle>
            <p className="text-sm text-slate-400">
              Individual subtask completion ratio across all assigned tasks.
            </p>
          </CardHeader>
          <CardContent className="mt-6 space-y-2 p-0">
            {subtaskProgress.map((u) => (
              <div
                key={u.userId}
                className="rounded-[20px] bg-background px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {u.userName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {u.taskCount} task{u.taskCount === 1 ? "" : "s"} · {u.totalSubtasks} subtask{u.totalSubtasks === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {u.completedSubtasks}/{u.totalSubtasks}
                    </p>
                    <p className="text-xs text-slate-400">
                      {u.progress}% done
                    </p>
                  </div>
                  <div className="hidden w-40 md:block">
                    <Progress
                      className="h-2 bg-slate-100"
                      value={Math.min(100, u.progress)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
