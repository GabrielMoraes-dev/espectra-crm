import Link from "next/link";
import { Rocket, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { GerarLinkPagamento } from "@/components/cliente/gerar-link-pagamento";
import { EnviarContrato } from "@/components/cliente/enviar-contrato";
import { ClientePesquisas } from "@/components/cliente/cliente-pesquisas";
import { ETAPA_PROJETO_CONFIG } from "@/lib/constants";
import { formatCurrency, formatDate, formatDataPrazo } from "@/lib/utils";
import type { Pagamento, PesquisaSatisfacao, Projeto } from "@/generated/prisma/client";

export function ClienteSideCards({
  clienteId,
  projetos,
  pagamentos,
  pesquisas,
  cpfCnpj,
  contratoAutentiqueId,
  contratoUrl,
}: {
  clienteId: string;
  projetos: Projeto[];
  pagamentos: Pagamento[];
  pesquisas: PesquisaSatisfacao[];
  cpfCnpj: string | null;
  contratoAutentiqueId: string | null;
  contratoUrl: string | null;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          {projetos.length === 0 ? (
            <EmptyState icon={Rocket} title="Nenhum projeto vinculado" />
          ) : (
            <div className="space-y-3">
              {projetos.map((projeto) => {
                const config = ETAPA_PROJETO_CONFIG[projeto.status];
                return (
                  <div key={projeto.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo</p>
                      <p className="text-sm font-medium text-foreground">{formatDataPrazo(projeto.prazo)}</p>
                    </div>
                    <StatusBadge label={config.label} className={config.className} />
                  </div>
                );
              })}
              <Link
                href="/projetos"
                className="block text-xs font-medium text-brand-100 hover:underline"
              >
                Ver no quadro de projetos →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

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

      <ClientePesquisas pesquisas={pesquisas} />
    </div>
  );
}
