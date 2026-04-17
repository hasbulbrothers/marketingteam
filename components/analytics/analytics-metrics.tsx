import { Badge } from "@/components/ui/badge";

export function mapStatusVariant(status: string): "default" | "secondary" | "outline" {
  const normalized = status.toLowerCase();
  if (normalized === "active") return "default";
  if (normalized === "review") return "secondary";
  return "outline";
}

export function SpotlightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-slate-50 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-bold text-slate-900 sm:text-lg">{value}</p>
    </div>
  );
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
