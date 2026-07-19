"use client";

import { useOptimistic, useTransition } from "react";
import { CheckSquare } from "lucide-react";
import { CHECKLIST_ETAPA_PROJETO } from "@/lib/constants";
import { toggleChecklistItem } from "@/lib/actions/projeto-actions";
import { cn } from "@/lib/utils";
import type { EtapaProjeto } from "@/generated/prisma/client";

export function ProjetoChecklist({
  projetoId,
  status,
  checklistConcluido,
}: {
  projetoId: string;
  status: EtapaProjeto;
  checklistConcluido: string;
}) {
  const itens = CHECKLIST_ETAPA_PROJETO[status] ?? [];
  const concluidosSalvos: string[] = JSON.parse(checklistConcluido || "[]");
  const [concluidos, marcarOtimista] = useOptimistic(concluidosSalvos, (atual: string[], itemId: string) =>
    atual.includes(itemId) ? atual.filter((i) => i !== itemId) : [...atual, itemId],
  );
  const [, startTransition] = useTransition();

  if (itens.length === 0) return null;

  const feitos = itens.filter((item) => concluidos.includes(item.id)).length;

  function handleToggle(itemId: string) {
    startTransition(async () => {
      marcarOtimista(itemId);
      await toggleChecklistItem(projetoId, itemId);
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CheckSquare className="size-3.5" /> Checklist da etapa
        </p>
        <span className="text-xs text-muted-foreground">{feitos}/{itens.length}</span>
      </div>
      <ul className="space-y-1.5">
        {itens.map((item) => {
          const feito = concluidos.includes(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-accent/50"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border border-border",
                    feito && "border-success bg-success text-success-foreground",
                  )}
                >
                  {feito && (
                    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={cn("text-sm text-foreground", feito && "text-muted-foreground line-through")}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
