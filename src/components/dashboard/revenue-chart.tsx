"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const config: ChartConfig = {
  receita: { label: "Receita", color: "var(--color-chart-2)" },
};

export function RevenueChart({ data }: { data: { mes: string; receita: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <AreaChart data={data} margin={{ left: -16, right: 8 }}>
        <defs>
          <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-receita)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-receita)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeOpacity={0.15} />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
          cursor={false}
        />
        <Area
          dataKey="receita"
          type="monotone"
          stroke="var(--color-receita)"
          fill="url(#fillReceita)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
