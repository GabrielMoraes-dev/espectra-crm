"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ListTodo, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TarefaFormDialog } from "@/components/tarefas/tarefa-form-dialog";
import { STATUS_TAREFA_CONFIG } from "@/lib/constants";
import { formatDataPrazo } from "@/lib/utils";
import type { Cliente, MembroEquipe, Tarefa } from "@/generated/prisma/client";

type TarefaComResponsavel = Tarefa & { responsavel: MembroEquipe | null };

export function ClienteTarefas({
  clienteId,
  tarefas,
  membros,
  clientes,
}: {
  clienteId: string;
  tarefas: TarefaComResponsavel[];
  membros: MembroEquipe[];
  clientes: Cliente[];
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarefa, setEditTarefa] = useState<TarefaComResponsavel | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpenCreate(true)}>
            <Plus className="size-4" />
            Nova
          </Button>
        </CardHeader>
        <CardContent>
          {tarefas.length === 0 ? (
            <EmptyState icon={ListTodo} title="Nenhuma tarefa vinculada" />
          ) : (
            <div className="space-y-3">
              {tarefas.map((tarefa) => {
                const config = STATUS_TAREFA_CONFIG[tarefa.status];
                return (
                  <div key={tarefa.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{tarefa.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {tarefa.responsavel?.nome ?? "Sem responsável"}
                        {tarefa.prazo && ` · ${formatDataPrazo(tarefa.prazo)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={config.label} className={config.className} />
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditTarefa(tarefa)}>
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Link href="/tarefas" className="block text-xs font-medium text-brand-100 hover:underline">
                Ver no quadro de tarefas →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <TarefaFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        membros={membros}
        clientes={clientes}
        clienteIdFixo={clienteId}
      />
      <TarefaFormDialog
        open={!!editTarefa}
        onOpenChange={(o) => !o && setEditTarefa(null)}
        tarefa={editTarefa}
        membros={membros}
        clientes={clientes}
        clienteIdFixo={clienteId}
      />
    </>
  );
}
