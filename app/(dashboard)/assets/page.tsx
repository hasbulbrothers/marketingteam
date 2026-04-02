import { PageHeader } from "@/components/layout/page-header";

const assetGroups = [
  { title: "Campaign references", copy: "Briefs, direction notes, and competitor references for active launches." },
  { title: "Approved visuals", copy: "Final artwork, resized exports, and ready-to-publish design files." },
  { title: "Video exports", copy: "Short-form cuts, final renders, subtitles, and delivery-ready versions." },
  { title: "Brand templates", copy: "Reusable layouts, social kits, and evergreen internal assets." },
];

export default function AssetsPage() {
  return (
    <div className="page-frame">
      <PageHeader
        eyebrow="Assets"
        title="Keep campaign files and references close to the task"
        description="A calm asset library for approved creative, campaign references, and reusable templates tied to daily production work."
      />
      <section className="premium-card border-none p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">Planned asset groups</h2>
          <p className="text-sm text-slate-400">A premium placeholder for the asset system that will support the next phase.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {assetGroups.map((group) => (
            <div key={group.title} className="rounded-[28px] bg-white px-6 py-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">{group.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{group.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
