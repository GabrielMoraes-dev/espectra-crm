"use client";

import { Filter } from "lucide-react";
import { Cell, Funnel, FunnelChart, LabelList, Tooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/empty-state";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--brand-300)",
];

export function FunilChart({
  data,
}: {
  data: { etapa: string; label: string; total: number }[];
}) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.etapa, { label: d.label, color: COLORS[i % COLORS.length] }]),
  );

  const totalGeral = data.reduce((acc, d) => acc + d.total, 0);

  if (totalGeral === 0) {
    return (
      <EmptyState
        icon={Filter}
        title="Nenhum lead ainda"
        description="O funil de conversão aparece aqui assim que houver leads cadastrados."
        className="h-[220px] justify-center py-0"
      />
    );
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <FunnelChart>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload as { label: string; total: number };
            return (
              <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                <p className="font-medium text-popover-foreground">{item.label}</p>
                <p className="text-muted-foreground">{item.total} lead{item.total !== 1 ? "s" : ""}</p>
              </div>
            );
          }}
        />
        <Funnel data={data} dataKey="total" nameKey="label" isAnimationActive>
          <LabelList position="right" dataKey="label" fill="var(--color-foreground)" stroke="none" fontSize={11} />
          {data.map((entry, index) => (
            <Cell key={entry.etapa} fill={COLORS[index % COLORS.length]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ChartContainer>
  );
}
