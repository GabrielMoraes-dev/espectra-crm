"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
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
import { TarefaDetailSheet } from "@/components/tarefas/tarefa-detail-sheet";
import { PRIORIDADE_TAREFA_CONFIG, STATUS_TAREFA_CONFIG } from "@/lib/constants";
import { formatDataPrazo, getPrazoUrgencia, initials } from "@/lib/utils";
import type { Cliente, MembroEquipe, Tarefa } from "@/generated/prisma/client";

type TarefaCompleta = Tarefa & { responsavel: MembroEquipe | null; cliente: Cliente | null };

export function TarefasTable({
  tarefas,
  membros,
  clientes,
}: {
  tarefas: TarefaCompleta[];
  membros: MembroEquipe[];
  clientes: Cliente[];
}) {
  const [selected, setSelected] = useState<TarefaCompleta | null>(null);

  if (tarefas.length === 0) {
    return (
      <EmptyState icon={ListChecks} title="Nenhuma tarefa encontrada" description="Ajuste os filtros ou crie uma nova tarefa." />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Prazo</TableHead>
              <TableHead className="hidden lg:table-cell">Responsável</TableHead>
              <TableHead className="hidden lg:table-cell">Cliente</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tarefas.map((tarefa) => {
              const prioridadeConfig = PRIORIDADE_TAREFA_CONFIG[tarefa.prioridade];
              const statusConfig = STATUS_TAREFA_CONFIG[tarefa.status];
              const urgencia = tarefa.status !== "CONCLUIDA" ? getPrazoUrgencia(tarefa.prazo) : null;
              return (
                <TableRow
                  key={tarefa.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(tarefa)}
                >
                  <TableCell>
                    <p className="max-w-56 truncate text-sm font-medium text-foreground">{tarefa.titulo}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{formatDataPrazo(tarefa.prazo)}</span>
                      {urgencia && <StatusBadge label={urgencia.label} className={urgencia.className} />}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {tarefa.responsavel ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">
                            {initials(tarefa.responsavel.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{tarefa.responsavel.nome}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {tarefa.cliente?.nome ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={prioridadeConfig.label} className={prioridadeConfig.className} />
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

      <TarefaDetailSheet
        tarefa={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        membros={membros}
        clientes={clientes}
      />
    </>
  );
}
