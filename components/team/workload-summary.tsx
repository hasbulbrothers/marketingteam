import { Card, CardContent } from "@/components/ui/card";

export function WorkloadSummary({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="premium-card h-40 border-none">
          <CardContent className="flex h-full flex-col justify-between p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
            <p className="text-5xl font-bold tracking-tight text-slate-900">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
