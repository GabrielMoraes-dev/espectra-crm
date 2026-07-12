import Link from "next/link";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { GerarLinkPagamento } from "@/components/cliente/gerar-link-pagamento";
import { EnviarContrato } from "@/components/cliente/enviar-contrato";
import { ClientePesquisas } from "@/components/cliente/cliente-pesquisas";
import { ClienteProjetoCard } from "@/components/cliente/cliente-projeto-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { MembroEquipe, Pagamento, PesquisaSatisfacao, Projeto } from "@/generated/prisma/client";

export function ClienteSideCards({
  clienteId,
  projetos,
  pagamentos,
  pesquisas,
  membros,
  cpfCnpj,
  contratoAutentiqueId,
  contratoUrl,
}: {
  clienteId: string;
  projetos: Projeto[];
  pagamentos: Pagamento[];
  pesquisas: PesquisaSatisfacao[];
  membros: MembroEquipe[];
  cpfCnpj: string | null;
  contratoAutentiqueId: string | null;
  contratoUrl: string | null;
}) {
  return (
    <div className="space-y-4">
      <ClienteProjetoCard clienteId={clienteId} projetos={projetos} membros={membros} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {pagamentos.length === 0 ? (
            <EmptyState icon={Wallet} title="Nenhum pagamento registrado" />
          ) : (
            <ul className="space-y-3">
              {pagamentos.map((pagamento) => (
                <li key={pagamento.id} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(pagamento.valor)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pagamento.formaPagamento} · {formatDate(pagamento.data)}
                    </p>
                  </div>
                  <StatusBadge
                    label={pagamento.pago ? "Pago" : "Pendente"}
                    className={pagamento.pago ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}
                  />
                </li>
              ))}
              <Link
                href="/financeiro"
                className="block text-xs font-medium text-brand-100 hover:underline"
              >
                Ver no financeiro →
              </Link>
            </ul>
          )}
          <GerarLinkPagamento clienteId={clienteId} />
        </CardContent>
      </Card>

      <EnviarContrato
        clienteId={clienteId}
        cpfCnpj={cpfCnpj}
        contratoAutentiqueId={contratoAutentiqueId}
        contratoUrl={contratoUrl}
      />

      <ClientePesquisas clienteId={clienteId} pesquisas={pesquisas} />
    </div>
  );
}
