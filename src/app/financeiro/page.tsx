import { PageHeader } from "@/components/shared/page-header";
import { FinanceiroToolbar } from "@/components/financeiro/financeiro-toolbar";
import { FinanceiroSummaryCards } from "@/components/financeiro/financeiro-summary-cards";
import { FinanceiroTable } from "@/components/financeiro/financeiro-table";
import { FadeIn } from "@/components/shared/fade-in";
import { getFinanceiroData } from "@/lib/data/financeiro";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const status = params.status ?? "";
  const sort = (params.sort as "recentes" | "antigos" | "maior-valor" | "menor-valor") ?? "recentes";

  const [{ pagamentos, resumo }, clientes] = await Promise.all([
    getFinanceiroData({ search, status, sort }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Pagamentos, receita e ticket médio da operação."
      />

      <FinanceiroSummaryCards resumo={resumo} />

      <FinanceiroToolbar search={search} status={status} sort={sort} clientes={clientes} />

      <FadeIn>
        <FinanceiroTable pagamentos={pagamentos} clientes={clientes} />
      </FadeIn>
    </div>
  );
}
