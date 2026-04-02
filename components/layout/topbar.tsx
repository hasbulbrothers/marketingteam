"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Bell, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-6 bg-background/80 px-6 py-6 backdrop-blur-md xl:px-12">
      <div className="relative w-full max-w-lg">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="h-12 rounded-2xl border-none bg-white pl-11 pr-4 text-sm shadow-sm ring-0 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
          placeholder="Search tasks, campaigns, or descriptions"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/95" type="button">
          <Plus className="h-4 w-4" />
          Create task
        </button>
        <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-400 transition-colors hover:text-slate-700" type="button">
          <Bell className="h-5 w-5" />
        </button>
        {hasClerk ? (
          <UserButton afterSignOutUrl="/sign-in" />
        ) : (
          <Link href="/sign-in" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Preview mode
          </Link>
        )}
      </div>
    </header>
  );
}
