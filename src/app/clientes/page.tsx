import { PageHeader } from "@/components/shared/page-header";
import { ClientesToolbar } from "@/components/clientes/clientes-toolbar";
import { ClientesTable } from "@/components/clientes/clientes-table";
import { FadeIn } from "@/components/shared/fade-in";
import { getClientes } from "@/lib/data/clientes";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const status = params.status ?? "";
  const nicho = params.nicho ?? "";
  const sort = (params.sort as "recentes" | "antigos" | "maior-valor" | "menor-valor") ?? "recentes";

  const [clientes, membros] = await Promise.all([
    getClientes({ search, status, nicho, sort }),
    prisma.membroEquipe.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Carteira de clientes ativos e finalizados da Espectra."
      />

      <ClientesToolbar search={search} status={status} nicho={nicho} sort={sort} membros={membros} />

      <FadeIn>
        <ClientesTable clientes={clientes} />
      </FadeIn>
    </div>
  );
}
