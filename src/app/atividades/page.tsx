import { PageHeader } from "@/components/shared/page-header";
import { FadeIn } from "@/components/shared/fade-in";
import { AtividadesToolbar } from "@/components/atividades/atividades-toolbar";
import { AtividadesList } from "@/components/atividades/atividades-list";
import { getAtividades } from "@/lib/data/atividades";

export const dynamic = "force-dynamic";

export default async function AtividadesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const tipo = params.tipo ?? "";
  const page = Number(params.page ?? "1") || 1;

  const { atividades, total, totalPaginas, tipos } = await getAtividades({ search, tipo, page });

  function buildHref(p: number) {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (tipo) query.set("tipo", tipo);
    if (p > 1) query.set("page", String(p));
    const qs = query.toString();
    return qs ? `/atividades?${qs}` : "/atividades";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atividades"
        description="Histórico completo de tudo que aconteceu no CRM."
      />

      <AtividadesToolbar search={search} tipo={tipo} tipos={tipos} />

      <FadeIn>
        <AtividadesList
          atividades={atividades}
          total={total}
          page={page}
          totalPaginas={totalPaginas}
          buildHref={buildHref}
        />
      </FadeIn>
    </div>
  );
}
