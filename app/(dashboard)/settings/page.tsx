import { PageHeader } from "@/components/layout/page-header";
import { UserManagement } from "@/components/settings/user-management";

export default function SettingsPage() {
  return (
    <div className="page-frame gap-6 py-8">
      <PageHeader eyebrow="Settings" title="Manage your workspace" description="Configure users, roles, and workspace preferences." />
      <UserManagement />
    </div>
  );
}
