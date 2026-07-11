"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wallet, Download } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PagamentoDetailSheet } from "@/components/financeiro/pagamento-detail-sheet";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { togglePagamentoPago } from "@/lib/actions/pagamento-actions";
import type { Cliente, Pagamento } from "@/generated/prisma/client";

type PagamentoCompleto = Pagamento & { cliente: Cliente };

function exportarCsv(pagamentos: PagamentoCompleto[]) {
  const linhas = [
    ["Cliente", "Empresa", "Valor", "Desconto", "Forma de pagamento", "Status", "Data"],
    ...pagamentos.map((p) => [
      p.cliente.nome,
      p.cliente.empresa ?? "",
      p.valor.toFixed(2).replace(".", ","),
      p.desconto ? `${p.desconto}%` : "",
      p.formaPagamento ?? "",
      p.pago ? "Pago" : "Pendente",
      new Date(p.data).toLocaleDateString("pt-BR"),
    ]),
  ];
  const csv = linhas.map((linha) => linha.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
      <div className="mb-3 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => exportarCsv(pagamentos)}>
          <Download className="size-4" />
          Baixar CSV
        </Button>
      </div>
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
                <TableCell className="text-sm font-medium font-mono">
                  <div className="flex items-center gap-2">
                    {formatCurrency(pagamento.valor)}
                    {pagamento.desconto && (
                      <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-sans font-semibold text-warning">
                        -{pagamento.desconto}%
                      </span>
                    )}
                  </div>
                </TableCell>
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
                      try {
                        await togglePagamentoPago(pagamento.id, checked);
                        toast.success(checked ? "Marcado como pago" : "Marcado como pendente");
                      } catch {
                        toast.error("Não foi possível atualizar o pagamento.");
                      }
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
