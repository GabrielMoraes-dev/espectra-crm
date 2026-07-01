import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand-500/40">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <p
              className={cn(
                "text-xs font-medium",
                tone === "success" && "text-success",
                tone === "warning" && "text-warning",
                tone === "default" && "text-muted-foreground",
              )}
            >
              {hint}
            </p>
          )}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-brand-100">
          <Icon className="size-[18px]" />
        </div>
      </div>
    </div>
  );
}
