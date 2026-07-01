import { PageHeader } from "@/components/shared/page-header";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsKanban } from "@/components/leads/leads-kanban";
import { FadeIn } from "@/components/shared/fade-in";
import { getLeads } from "@/lib/data/leads";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const origem = params.origem ?? "";
  const sort = (params.sort as "recentes" | "antigos" | "maior-valor" | "menor-valor") ?? "recentes";
  const view = params.view ?? "table";

  const [leads, membros] = await Promise.all([
    getLeads({ search, origem, sort }),
    prisma.membroEquipe.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Funil comercial — do primeiro contato ao fechamento."
      />

      <LeadsToolbar search={search} origem={origem} sort={sort} view={view} />

      <FadeIn>
        {view === "kanban" ? (
          <LeadsKanban leads={leads} membros={membros} />
        ) : (
          <LeadsTable leads={leads} membros={membros} />
        )}
      </FadeIn>
    </div>
  );
}
