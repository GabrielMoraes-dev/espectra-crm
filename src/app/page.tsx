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
import { FunilChart } from "@/components/dashboard/funil-chart";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { SatisfacaoCard } from "@/components/dashboard/satisfacao-card";
import { RecentClientsTable } from "@/components/dashboard/recent-clients-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PrazoAlertBanner } from "@/components/shared/prazo-alert-banner";
import { PendenciasCard } from "@/components/dashboard/pendencias-card";
import { PagamentosSemMatchCard } from "@/components/dashboard/pagamentos-sem-match-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/dashboard";
import { getPesquisaStats } from "@/lib/data/pesquisas";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, pesquisaStats] = await Promise.all([getDashboardData(), getPesquisaStats()]);
  const { stats } = data;

  const receitaHintPartes = [];
  if (stats.variacaoReceitaMes !== null) {
    const sinal = stats.variacaoReceitaMes >= 0 ? "+" : "";
    receitaHintPartes.push(`${sinal}${stats.variacaoReceitaMes.toFixed(0)}% vs mês passado`);
  }
  if (stats.metaFaturamentoMensal) {
    const pctMeta = Math.round((stats.receitaDoMes / stats.metaFaturamentoMensal) * 100);
    receitaHintPartes.push(`${pctMeta}% da meta`);
  }
  const receitaHint = receitaHintPartes.length > 0 ? receitaHintPartes.join(" · ") : "pagamentos confirmados";

  const cards = [
    { label: "Leads", value: String(stats.leadsAtivos), icon: Inbox, hint: "no funil" },
    { label: "Clientes Ativos", value: String(stats.clientesAtivos), icon: Users, hint: "em atendimento" },
    { label: "Projetos em andamento", value: String(stats.projetosEmAndamento), icon: Rocket, hint: "em produção" },
    { label: "Projetos concluídos", value: String(stats.projetosConcluidos), icon: CheckCircle2, hint: "publicados", tone: "success" as const },
    { label: "Receita do mês", value: formatCurrency(stats.receitaDoMes), icon: Wallet, hint: receitaHint, tone: "success" as const },
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

      <FadeIn>
        <PendenciasCard pendencias={data.pendenciasContratoPagamento} />
      </FadeIn>

      <FadeIn>
        <PagamentosSemMatchCard
          pagamentos={data.pagamentosSemMatch}
          clientes={data.clientesParaVincular}
        />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <FadeIn key={card.label} delay={i * 0.04}>
            <StatCard {...card} />
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.08}>
        <SatisfacaoCard porNota={pesquisaStats.porNota} />
      </FadeIn>

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
          <ChartCard
            title="Funil de conversão"
            description={
              stats.taxaConversaoFunil !== null
                ? `${stats.taxaConversaoFunil.toFixed(0)}% dos leads viram cliente`
                : "Leads em cada etapa do funil"
            }
          >
            <FunilChart data={data.funilLeads} />
          </ChartCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Últimos clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentClientsTable clientes={data.clientesRecentes} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.28} className="lg:col-span-2">
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
