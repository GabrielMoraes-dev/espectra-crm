import { PageHeader } from "@/components/shared/page-header";
import { FadeIn } from "@/components/shared/fade-in";
import { DuplaCard } from "@/components/estrutura/dupla-card";
import { FluxoOperacional } from "@/components/estrutura/fluxo-operacional";
import { Filosofia } from "@/components/estrutura/filosofia";
import { LinksGrid } from "@/components/estrutura/links-grid";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EstruturaOperacionalPage() {
  const [membros, links] = await Promise.all([
    prisma.membroEquipe.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.linkInterno.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estrutura Operacional"
        description="Conheça como a Espectra organiza seus processos internos, responsabilidades e fluxo operacional do primeiro contato até a entrega final."
      />

      <FadeIn>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {membros.map((membro) => (
            <DuplaCard key={membro.id} membro={membro} />
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <FluxoOperacional />
      </FadeIn>

      <FadeIn delay={0.1}>
        <Filosofia />
      </FadeIn>

      <FadeIn delay={0.14}>
        <LinksGrid links={links} />
      </FadeIn>
    </div>
  );
}
