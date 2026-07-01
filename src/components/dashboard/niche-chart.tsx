"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--brand-300)",
];

export function NicheChart({ data }: { data: { nicho: string; total: number }[] }) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.nicho, { label: d.nicho, color: COLORS[i % COLORS.length] }]),
  );

  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="nicho" hideLabel />} />
        <Pie
          data={data}
          dataKey="total"
          nameKey="nicho"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={entry.nicho} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
