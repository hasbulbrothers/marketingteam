"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { navigationItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const currentUser = useQuery(api.users.queries.getCurrentUser, isAuthed ? {} : "skip") as { role?: string } | null | undefined;
  const isAdmin = currentUser?.role === "admin";

  const visibleItems = navigationItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed top-0 left-0 hidden h-screen w-72 overflow-y-auto border-r border-sidebar-border bg-sidebar px-8 py-8 lg:block">
      <div className="flex min-h-full flex-col">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold leading-tight text-slate-900">HB Marketing</h2>
            <p className="text-xs font-medium text-slate-400">Internal workspace</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {visibleItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "sidebar-active"
                    : "text-slate-500 hover:text-primary hover:bg-white/80",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Focus</p>
            <p className="text-sm leading-7 text-slate-600">Keep the board updated before stand-up.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500">
              HB
            </div>
            <p className="text-sm font-semibold text-slate-800">H. Barkworth</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
