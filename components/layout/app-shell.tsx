import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="min-h-screen lg:ml-72">
        <Topbar />
        <div>{children}</div>
      </main>
    </div>
  );
}
