import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateLong } from "@/lib/utils";
import type { PesquisaSatisfacao } from "@/generated/prisma/client";

const LABELS = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

const PERGUNTAS = [
  { key: "qualidade" as const, label: "Qualidade do resultado final" },
  { key: "comunicacao" as const, label: "Comunicação durante o projeto" },
  { key: "prazos" as const, label: "Cumprimento dos prazos" },
  { key: "atendimento" as const, label: "Atendimento e suporte" },
];

export function ClientePesquisas({ pesquisas }: { pesquisas: PesquisaSatisfacao[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pesquisa de satisfação</CardTitle>
      </CardHeader>
      <CardContent>
        {pesquisas.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Nenhuma avaliação recebida ainda"
            description="A pesquisa é enviada automaticamente quando o projeto é finalizado."
          />
        ) : (
          <div className="space-y-6">
            {pesquisas.map((p) => (
              <div
                key={p.id}
                className="space-y-3 border-b border-border pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-300">{p.nota}</span>
                    <span className="text-sm text-muted-foreground">/ 5</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateLong(p.createdAt)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {PERGUNTAS.map((pergunta) => (
                    <div key={pergunta.key}>
                      <p className="text-xs font-medium text-muted-foreground">
                        {pergunta.label}
                      </p>
                      <p className="text-sm text-foreground">{LABELS[p[pergunta.key] - 1]}</p>
                    </div>
                  ))}
                </div>

                {p.comentario && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Comentário</p>
                    <p className="text-sm whitespace-pre-line text-foreground">{p.comentario}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
