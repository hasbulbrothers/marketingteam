"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrentUserProfile } from "@/types/user";
import { CreateTeamDialog, DeleteTeamButton, EditTeamDialog, ManageMembersDialog } from "./team-dialogs";
import type { TeamSummary, UserSummary } from "./team-form-fields";

export function TeamsManagement() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const currentUser = useQuery(api.users.queries.getCurrentUser, isAuthed ? {} : "skip") as CurrentUserProfile | null | undefined;
  const isAdmin = currentUser?.role === "admin";
  const teams = useQuery(api.teams.queries.listTeams, isAdmin ? {} : "skip") as TeamSummary[] | undefined;
  const users = useQuery(api.users.queries.getUsers, isAdmin ? {} : "skip") as UserSummary[] | undefined;

  if (!isAdmin) return null;

  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">Teams</CardTitle>
          <p className="text-sm text-slate-400">Group members into teams to measure KPI achievement per team.</p>
        </div>
        <CreateTeamDialog users={users ?? []} />
      </CardHeader>
      <CardContent className="mt-6 p-0">
        {!teams ? (
          <p className="text-sm text-slate-400">Loading teams…</p>
        ) : teams.length === 0 ? (
          <div className="rounded-[24px] bg-background px-6 py-10 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No teams yet</p>
            <p className="mt-1 text-xs text-slate-400">Create your first team to start grouping members.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} users={users ?? []} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamCard({ team, users }: { team: TeamSummary; users: UserSummary[] }) {
  const members = users.filter((u) => String(u.teamId) === team.id);
  const color = team.color ?? "#64748b";

  return (
    <div className="rounded-[24px] bg-background px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-1 h-3 w-3 flex-none rounded-full" style={{ backgroundColor: color }} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{team.name}</p>
            {team.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{team.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditTeamDialog team={team} users={users} />
          <DeleteTeamButton teamId={team.id} teamName={team.name} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-400">Members</p>
          <p className="text-sm font-semibold text-slate-800">{team.memberCount}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Leader</p>
          <p className="truncate text-sm font-semibold text-slate-800">{team.leader?.name ?? "—"}</p>
        </div>
      </div>
      <div className="mt-4">
        <ManageMembersDialog teamId={team.id} teamName={team.name} members={members} availableUsers={users.filter((u) => !u.teamId)} />
      </div>
    </div>
  );
}
