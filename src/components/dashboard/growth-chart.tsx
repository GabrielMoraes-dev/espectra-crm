"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config: ChartConfig = {
  clientes: { label: "Clientes acumulados", color: "var(--color-chart-3)" },
};

export function GrowthChart({ data }: { data: { mes: string; clientes: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <LineChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.15} />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <Line
          dataKey="clientes"
          type="monotone"
          stroke="var(--color-clientes)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-clientes)", strokeWidth: 0 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
