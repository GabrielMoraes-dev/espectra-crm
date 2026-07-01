"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config: ChartConfig = {
  vendas: { label: "Novos clientes", color: "var(--color-chart-1)" },
};

export function SalesChart({ data }: { data: { mes: string; vendas: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.15} />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <Bar dataKey="vendas" fill="var(--color-vendas)" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ChartContainer>
  );
}
