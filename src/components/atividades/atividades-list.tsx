import Link from "next/link";
import { ArrowRightCircle, ChevronLeft, ChevronRight, History } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ICONS, TIPOS_AVISO } from "@/components/dashboard/activity-feed";
import { formatDateLong, timeAgo } from "@/lib/utils";
import type { ActivityLog } from "@/generated/prisma/client";

export function AtividadesList({
  atividades,
  total,
  page,
  totalPaginas,
  buildHref,
}: {
  atividades: ActivityLog[];
  total: number;
  page: number;
  totalPaginas: number;
  buildHref: (page: number) => string;
}) {
  if (atividades.length === 0) {
    return (
      <EmptyState icon={History} title="Nenhuma atividade encontrada" description="Ajuste os filtros ou aguarde novas atividades acontecerem." />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{total} atividade{total !== 1 ? "s" : ""} no total</p>

      <ul className="divide-y divide-border rounded-xl border border-border">
        {atividades.map((a) => {
          const Icon = ICONS[a.tipo] ?? ArrowRightCircle;
          const isFalha = TIPOS_AVISO.has(a.tipo);
          return (
            <li key={a.id} className="flex items-start gap-3 p-4">
              <div
                className={
                  isFalha
                    ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning"
                    : "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-brand-100"
                }
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{a.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateLong(a.createdAt)} · {timeAgo(a.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <Link
            href={buildHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            <ChevronLeft className="size-3.5" /> Anterior
          </Link>
          <p className="text-xs text-muted-foreground">Página {page} de {totalPaginas}</p>
          <Link
            href={buildHref(Math.min(totalPaginas, page + 1))}
            aria-disabled={page >= totalPaginas}
            className={`flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent ${page >= totalPaginas ? "pointer-events-none opacity-40" : ""}`}
          >
            Próxima <ChevronRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
