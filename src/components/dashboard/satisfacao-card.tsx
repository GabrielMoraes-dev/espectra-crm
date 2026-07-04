"use client";

import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { Star, ChevronDown } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const LABELS = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"];
const COLORS = [
  "var(--color-chart-5)",
  "var(--color-chart-4)",
  "var(--color-chart-3)",
  "var(--color-chart-2)",
  "var(--color-chart-1)",
];

function StarsDisplay({ value, size }: { value: number; size: number }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)) * 100;
        return (
          <span key={i} className="relative inline-block" style={{ height: size, width: size }}>
            <Star className="absolute inset-0 h-full w-full text-muted-foreground/40" />
            <span
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}
            >
              <Star className="h-full w-full fill-current text-brand-300" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function SatisfacaoCard({ porNota }: { porNota: { nota: number; total: number }[] }) {
  const [expanded, setExpanded] = useState(false);

  const total = porNota.reduce((sum, p) => sum + p.total, 0);
  const mediaNota = total > 0 ? porNota.reduce((sum, p) => sum + p.nota * p.total, 0) / total : 0;

  const data = porNota
    .filter((p) => p.total > 0)
    .map((p) => ({ nota: p.nota, label: LABELS[p.nota - 1], total: p.total }));

  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.label, { label: d.label, color: COLORS[d.nota - 1] }]),
  );

  return (
    <Card className="py-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Satisfação dos clientes</span>
          {total > 0 && (
            <div className="flex items-center gap-2">
              <StarsDisplay value={mediaNota} size={14} />
              <span className="text-xs text-muted-foreground">
                {mediaNota.toFixed(1)} de 5 · {total} {total > 1 ? "avaliações" : "avaliação"}
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pt-4 pb-5">
          {total === 0 ? (
            <EmptyState
              icon={Star}
              title="Nenhuma resposta ainda"
              description="As avaliações dos clientes vão aparecer aqui assim que responderem a pesquisa."
            />
          ) : (
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                <StarsDisplay value={mediaNota} size={24} />
                <span className="text-sm text-muted-foreground">
                  {mediaNota.toFixed(1)} de 5 · {total} {total > 1 ? "avaliações" : "avaliação"}
                </span>
              </div>

              <ChartContainer config={config} className="aspect-auto h-[180px] w-full sm:w-[220px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                  <Pie
                    data={data}
                    dataKey="total"
                    nameKey="label"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.nota} fill={COLORS[entry.nota - 1]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="w-full space-y-2 sm:w-auto sm:min-w-[160px]">
                {[5, 4, 3, 2, 1].map((nota) => {
                  const count = porNota.find((p) => p.nota === nota)?.total ?? 0;
                  return (
                    <div key={nota} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {LABELS[nota - 1]} ({nota})
                      </span>
                      <span className="font-medium text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
