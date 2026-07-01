import { PageHeader } from "@/components/shared/page-header";
import { FadeIn } from "@/components/shared/fade-in";
import { ConfiguracaoForm } from "@/components/configuracoes/configuracao-form";
import { TemaCard } from "@/components/configuracoes/tema-card";
import { ContaCard } from "@/components/configuracoes/conta-card";
import { getConfiguracao } from "@/lib/data/configuracao";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const [config, membros] = await Promise.all([
    getConfiguracao(),
    prisma.membroEquipe.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Identidade, tema e acesso à conta da Espectra."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn className="lg:col-span-2">
          <ConfiguracaoForm config={config} />
        </FadeIn>
        <FadeIn delay={0.05}>
          <TemaCard />
        </FadeIn>
        <FadeIn delay={0.08}>
          <ContaCard membros={membros} />
        </FadeIn>
      </div>
    </div>
  );
}
