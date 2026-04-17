"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Bell, Plus, Search } from "lucide-react";
import { UserRolePill } from "@/components/layout/user-role-pill";
import { Input } from "@/components/ui/input";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function Topbar({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 bg-background/80 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-6 xl:px-12">
      <div className="relative w-full sm:max-w-lg">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="h-12 rounded-2xl border-none bg-white pl-11 pr-4 text-sm shadow-sm ring-0 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
          placeholder="Search tasks, campaigns, or descriptions"
        />
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <UserRolePill />
        <button
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/95 sm:px-6 sm:py-3"
          type="button"
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create task</span>
        </button>
        <button className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-400 transition-colors hover:text-slate-700 sm:p-3" type="button">
          <Bell className="h-5 w-5" />
        </button>
        {hasClerk ? (
          <UserButton />
        ) : (
          <Link href="/sign-in" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:px-5 sm:py-3">
            Preview
          </Link>
        )}
      </div>
    </header>
  );
}
