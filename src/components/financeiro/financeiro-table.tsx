"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import { PagamentoDetailSheet } from "@/components/financeiro/pagamento-detail-sheet";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { togglePagamentoPago } from "@/lib/actions/pagamento-actions";
import type { Cliente, Pagamento } from "@/generated/prisma/client";

type PagamentoCompleto = Pagamento & { cliente: Cliente };

export function FinanceiroTable({
  pagamentos,
  clientes,
}: {
  pagamentos: PagamentoCompleto[];
  clientes: Cliente[];
}) {
  const [selected, setSelected] = useState<PagamentoCompleto | null>(null);

  if (pagamentos.length === 0) {
    return (
      <EmptyState icon={Wallet} title="Nenhum pagamento encontrado" description="Ajuste os filtros ou registre um novo pagamento." />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="hidden sm:table-cell">Forma de pagamento</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead>Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagamentos.map((pagamento) => (
              <TableRow
                key={pagamento.id}
                className="cursor-pointer"
                onClick={() => setSelected(pagamento)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {initials(pagamento.cliente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{pagamento.cliente.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{pagamento.cliente.empresa}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium font-mono">{formatCurrency(pagamento.valor)}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {pagamento.formaPagamento ?? "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {formatDate(pagamento.data)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={pagamento.pago}
                    onCheckedChange={async (checked) => {
                      await togglePagamentoPago(pagamento.id, checked);
                      toast.success(checked ? "Marcado como pago" : "Marcado como pendente");
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PagamentoDetailSheet
        pagamento={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        clientes={clientes}
      />
    </>
  );
}
