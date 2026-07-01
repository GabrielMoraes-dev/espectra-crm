import { Wallet, TrendingUp, AlertTriangle, Receipt } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";

export function FinanceiroSummaryCards({
  resumo,
}: {
  resumo: { receitaDoMes: number; receitaTotal: number; pendentes: number; ticketMedio: number };
}) {
  const cards = [
    { label: "Receita do mês", value: formatCurrency(resumo.receitaDoMes), icon: Wallet, hint: "pagamentos confirmados", tone: "success" as const },
    { label: "Receita total", value: formatCurrency(resumo.receitaTotal), icon: TrendingUp, hint: "desde o início" },
    { label: "Valores pendentes", value: formatCurrency(resumo.pendentes), icon: AlertTriangle, hint: "a receber", tone: "warning" as const },
    { label: "Ticket médio", value: formatCurrency(resumo.ticketMedio), icon: Receipt, hint: "por pagamento" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
