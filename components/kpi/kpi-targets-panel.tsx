"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Target } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrentUserProfile } from "@/types/user";
import { KpiCard } from "./kpi-card";
import { KpiDialog } from "./kpi-dialog";
import type { KpiTargetView, TeamOption, UserOption } from "./kpi-types";

export function KpiTargetsPanel() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const currentUser = useQuery(api.users.queries.getCurrentUser, isAuthed ? {} : "skip") as CurrentUserProfile | null | undefined;
  const canManage = currentUser?.role === "admin";
  const kpis = useQuery(api.kpi.queries.listKpiTargets, isAuthed ? {} : "skip") as KpiTargetView[] | undefined;
  const teams = useQuery(api.teams.queries.listTeams, isAuthed ? {} : "skip") as { id: string; name: string }[] | undefined;
  const users = useQuery(api.users.queries.getUsers, isAuthed ? {} : "skip") as { _id: Id<"users">; name: string }[] | undefined;

  const teamOptions: TeamOption[] = (teams ?? []).map((t) => ({ id: t.id, name: t.name }));
  const userOptions: UserOption[] = (users ?? []).map((u) => ({ id: String(u._id), name: u.name }));
  const achievedCount = useMemo(() => (kpis ?? []).filter((k) => k.achieved).length, [kpis]);

  if (!currentUser) return null;

  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">KPI targets</CardTitle>
          <p className="text-sm text-slate-400">
            Track what each team or member needs to deliver each period.
            {kpis && kpis.length > 0 && (
              <> <span className="font-semibold text-slate-600">{achievedCount}/{kpis.length}</span> on track.</>
            )}
          </p>
        </div>
        {canManage && <KpiDialog mode="create" teamOptions={teamOptions} userOptions={userOptions} />}
      </CardHeader>
      <CardContent className="mt-6 p-0">
        {!kpis ? (
          <p className="text-sm text-slate-400">Loading KPIs…</p>
        ) : kpis.length === 0 ? (
          <div className="rounded-[24px] bg-background px-6 py-10 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No KPI targets yet</p>
            <p className="mt-1 text-xs text-slate-400">Set a target to measure what the team needs to deliver.</p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} canManage={canManage} teamOptions={teamOptions} userOptions={userOptions} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
