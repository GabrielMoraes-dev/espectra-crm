"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { STATUS_CLIENTE_CONFIG } from "@/lib/constants";
import { formatCurrency, initials } from "@/lib/utils";
import type { Cliente, MembroEquipe } from "@/generated/prisma/client";

type ClienteWithResponsavel = Cliente & { responsavel: MembroEquipe | null };

export function ClientesTable({
  clientes,
}: {
  clientes: ClienteWithResponsavel[];
}) {
  const router = useRouter();

  if (clientes.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
        description="Ajuste os filtros ou cadastre um novo cliente."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Nicho</TableHead>
            <TableHead className="hidden sm:table-cell">Valor</TableHead>
            <TableHead className="hidden lg:table-cell">Responsável</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => {
            const statusConfig = STATUS_CLIENTE_CONFIG[cliente.status];
            return (
              <TableRow
                key={cliente.id}
                className="cursor-pointer"
                onClick={() => router.push(`/clientes/${cliente.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {initials(cliente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{cliente.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{cliente.empresa}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {cliente.nicho ?? "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {formatCurrency(cliente.valor)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {cliente.responsavel?.nome ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge label={statusConfig.label} className={statusConfig.className} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
