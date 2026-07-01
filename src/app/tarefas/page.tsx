import { PageHeader } from "@/components/shared/page-header";
import { TarefasToolbar } from "@/components/tarefas/tarefas-toolbar";
import { TarefasBoard } from "@/components/tarefas/tarefas-board";
import { FadeIn } from "@/components/shared/fade-in";
import { PrazoAlertBanner } from "@/components/shared/prazo-alert-banner";
import { getTarefas } from "@/lib/data/tarefas";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const responsavelId = params.responsavel ?? "";
  const prioridade = params.prioridade ?? "";

  const [tarefas, membros, clientesComPrazo] = await Promise.all([
    getTarefas({ search, responsavelId, prioridade }),
    prisma.membroEquipe.findMany({ orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ where: { prazo: { not: null }, status: { not: "FINALIZADO" } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarefas"
        description="O que precisa ser feito, por quem e até quando."
      />

      <FadeIn>
        <PrazoAlertBanner clientes={clientesComPrazo} />
      </FadeIn>

      <TarefasToolbar search={search} responsavelId={responsavelId} prioridade={prioridade} membros={membros} />

      <FadeIn>
        <TarefasBoard tarefas={tarefas} membros={membros} />
      </FadeIn>
    </div>
  );
}
