import {
  Inbox,
  Users,
  Rocket,
  CheckCircle2,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FadeIn } from "@/components/shared/fade-in";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { NicheChart } from "@/components/dashboard/niche-chart";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { RecentClientsTable } from "@/components/dashboard/recent-clients-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PrazoAlertBanner } from "@/components/shared/prazo-alert-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();
  const { stats } = data;

  const cards = [
    { label: "Leads", value: String(stats.leadsAtivos), icon: Inbox, hint: "no funil" },
    { label: "Clientes Ativos", value: String(stats.clientesAtivos), icon: Users, hint: "em atendimento" },
    { label: "Projetos em andamento", value: String(stats.projetosEmAndamento), icon: Rocket, hint: "em produção" },
    { label: "Projetos concluídos", value: String(stats.projetosConcluidos), icon: CheckCircle2, hint: "publicados", tone: "success" as const },
    { label: "Receita do mês", value: formatCurrency(stats.receitaDoMes), icon: Wallet, hint: "pagamentos confirmados", tone: "success" as const },
    { label: "Pendências", value: formatCurrency(stats.pendencias), icon: AlertTriangle, hint: "a receber", tone: "warning" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação da Espectra."
      />

      <FadeIn>
        <PrazoAlertBanner clientes={data.clientesComPrazo} />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <FadeIn key={card.label} delay={i * 0.04}>
            <StatCard {...card} />
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.1}>
          <ChartCard title="Vendas por mês" description="Novos clientes fechados">
            <SalesChart data={data.vendasPorMes} />
          </ChartCard>
        </FadeIn>
        <FadeIn delay={0.13}>
          <ChartCard title="Receita" description="Pagamentos confirmados por mês">
            <RevenueChart data={data.receitaPorMes} />
          </ChartCard>
        </FadeIn>
        <FadeIn delay={0.16}>
          <ChartCard title="Clientes por nicho" description="Distribuição da carteira atual">
            <NicheChart data={data.nichoData} />
          </ChartCard>
        </FadeIn>
        <FadeIn delay={0.19}>
          <ChartCard title="Crescimento" description="Clientes acumulados nos últimos 6 meses">
            <GrowthChart data={data.crescimento} />
          </ChartCard>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.22}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Últimos clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentClientsTable clientes={data.clientesRecentes} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.25}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Atividades recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed atividades={data.atividadesRecentes} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
