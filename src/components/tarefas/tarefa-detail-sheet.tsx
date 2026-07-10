"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, UserSquare2, CalendarClock, Flag, AlignLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TarefaFormDialog } from "@/components/tarefas/tarefa-form-dialog";
import { PRIORIDADE_TAREFA_CONFIG, STATUS_TAREFA_CONFIG } from "@/lib/constants";
import { formatDataPrazo, getPrazoUrgencia } from "@/lib/utils";
import { deleteTarefa } from "@/lib/actions/tarefa-actions";
import type { MembroEquipe, Tarefa } from "@/generated/prisma/client";

type TarefaCompleta = Tarefa & { responsavel: MembroEquipe | null };

function InfoRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  badge?: { label: string; className: string } | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-100">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{value}</p>
          {badge && <StatusBadge label={badge.label} className={badge.className} />}
        </div>
      </div>
    </div>
  );
}

export function TarefaDetailSheet({
  tarefa,
  open,
  onOpenChange,
  membros,
}: {
  tarefa: TarefaCompleta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membros: MembroEquipe[];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  if (!tarefa) return null;

  const statusConfig = STATUS_TAREFA_CONFIG[tarefa.status];
  const prioridadeConfig = PRIORIDADE_TAREFA_CONFIG[tarefa.prioridade];
  const urgencia = tarefa.status !== "CONCLUIDA" ? getPrazoUrgencia(tarefa.prazo) : null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle>{tarefa.titulo}</SheetTitle>
              <StatusBadge label={statusConfig.label} className={statusConfig.className} />
            </div>
            <SheetDescription>
              <StatusBadge label={prioridadeConfig.label} className={prioridadeConfig.className} />
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <InfoRow
              icon={UserSquare2}
              label="Responsável"
              value={tarefa.responsavel?.nome ?? "—"}
            />
            <InfoRow
              icon={CalendarClock}
              label="Prazo"
              value={formatDataPrazo(tarefa.prazo)}
              badge={urgencia}
            />
            <InfoRow
              icon={Flag}
              label="Prioridade"
              value={prioridadeConfig.label}
            />

            {tarefa.descricao && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-100">
                  <AlignLeft className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="mt-0.5 text-sm text-foreground whitespace-pre-wrap">{tarefa.descricao}</p>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpenEdit(true)}>
              <Pencil className="size-4" /> Editar
            </Button>
            <Button variant="destructive" size="icon" onClick={() => setOpenDelete(true)}>
              <Trash2 className="size-4" />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <TarefaFormDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        tarefa={tarefa}
        membros={membros}
      />
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={`Excluir tarefa "${tarefa.titulo}"?`}
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          await deleteTarefa(tarefa.id);
          toast.success("Tarefa excluída");
          onOpenChange(false);
        }}
      />
    </>
  );
}
