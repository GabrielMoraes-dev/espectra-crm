import { PageHeader } from "@/components/shared/page-header";
import { ProjetosToolbar } from "@/components/projetos/projetos-toolbar";
import { ProjetosKanban } from "@/components/projetos/projetos-kanban";
import { ProjetosTable } from "@/components/projetos/projetos-table";
import { FadeIn } from "@/components/shared/fade-in";
import { getProjetos } from "@/lib/data/projetos";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const status = params.status ?? "";
  const view = params.view ?? "kanban";

  const [projetos, clientes, membros] = await Promise.all([
    getProjetos({ search, status }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.membroEquipe.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description="Do briefing à publicação — acompanhe cada entrega."
      />

      <ProjetosToolbar search={search} status={status} view={view} clientes={clientes} membros={membros} />

      <FadeIn>
        {view === "lista" ? (
          <ProjetosTable projetos={projetos} clientes={clientes} membros={membros} />
        ) : (
          <ProjetosKanban projetos={projetos} clientes={clientes} membros={membros} />
        )}
      </FadeIn>
    </div>
  );
}
