"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import type { PesquisaSatisfacao } from "@/generated/prisma/client";

const SITE_URL = "https://espectra-crm.vercel.app";

const LABELS = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

const PERGUNTAS = [
  { key: "qualidade" as const, label: "Qualidade" },
  { key: "comunicacao" as const, label: "Comunicação" },
  { key: "prazos" as const, label: "Prazos" },
  { key: "atendimento" as const, label: "Atendimento" },
];

export function ClientePesquisas({
  clienteId,
  pesquisas,
}: {
  clienteId: string;
  pesquisas: PesquisaSatisfacao[];
}) {
  function copiarLink() {
    navigator.clipboard.writeText(`${SITE_URL}/pesquisa/${clienteId}`);
    toast.success("Link copiado!");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pesquisa de satisfação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pesquisas.length === 0 ? (
          <EmptyState icon={Star} title="Nenhuma avaliação recebida ainda" />
        ) : (
          <ul className="space-y-4">
            {pesquisas.map((p) => (
              <li
                key={p.id}
                className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-brand-300">{p.nota}</span>
                    <span className="text-xs text-muted-foreground">/ 5</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {PERGUNTAS.map((pergunta) => (
                    <p key={pergunta.key} className="text-xs">
                      <span className="text-muted-foreground">{pergunta.label}: </span>
                      <span className="text-foreground">{LABELS[p[pergunta.key] - 1]}</span>
                    </p>
                  ))}
                </div>

                {p.comentario && (
                  <p className="text-xs whitespace-pre-line text-foreground">{p.comentario}</p>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border pt-3">
          <Button type="button" size="sm" variant="outline" onClick={copiarLink} className="w-full">
            Copiar link da pesquisa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
