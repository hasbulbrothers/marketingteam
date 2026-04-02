import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PublishingSnapshot({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold text-slate-900">Publishing snapshot</CardTitle>
        <p className="text-sm text-slate-400">A lightweight view of what is queued and what has already gone live.</p>
      </CardHeader>
      <CardContent className="mt-6 grid gap-3 p-0 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-[24px] bg-background px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
