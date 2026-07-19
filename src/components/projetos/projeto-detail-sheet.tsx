"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, UserSquare2, CalendarClock } from "lucide-react";
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
import { FotoGallery } from "@/components/shared/foto-gallery";
import { ProjetoFormDialog } from "@/components/projetos/projeto-form-dialog";
import { ProjetoChecklist } from "@/components/projetos/projeto-checklist";
import { ETAPA_PROJETO_CONFIG } from "@/lib/constants";
import { formatDataPrazo, getPrazoUrgencia } from "@/lib/utils";
import { deleteProjeto } from "@/lib/actions/projeto-actions";
import type { Cliente, FotoCliente, MembroEquipe, Projeto } from "@/generated/prisma/client";

type ProjetoCompleto = Projeto & { cliente: Cliente & { fotos: FotoCliente[] }; responsavel: MembroEquipe | null };

// Desativado a pedido do Ricardo — a organização do projeto ficou mais fácil pelo perfil do cliente.
const EXIBIR_FOTOS_PROJETO = false;

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

export function ProjetoDetailSheet({
  projeto,
  open,
  onOpenChange,
  clientes,
  membros,
}: {
  projeto: ProjetoCompleto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
  membros: MembroEquipe[];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  if (!projeto) return null;

  const etapaConfig = ETAPA_PROJETO_CONFIG[projeto.status];
  const urgencia = projeto.status !== "PUBLICADO" ? getPrazoUrgencia(projeto.prazo) : null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle>{projeto.cliente.nome}</SheetTitle>
              <StatusBadge label={etapaConfig.label} className={etapaConfig.className} />
            </div>
            <SheetDescription>{projeto.cliente.empresa || "Sem empresa informada"}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <InfoRow
              icon={CalendarClock}
              label="Prazo"
              value={formatDataPrazo(projeto.prazo)}
              badge={urgencia}
            />
            <InfoRow icon={UserSquare2} label="Responsável" value={projeto.responsavel?.nome ?? "—"} />

            <ProjetoChecklist
              projetoId={projeto.id}
              status={projeto.status}
              checklistConcluido={projeto.checklistConcluido}
            />

            {projeto.observacoes && (
              <div className="space-y-1 rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">Observações</p>
                <p className="text-sm text-foreground">{projeto.observacoes}</p>
              </div>
            )}

            {EXIBIR_FOTOS_PROJETO && (
              <FotoGallery clienteId={projeto.cliente.id} fotos={projeto.cliente.fotos} />
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

      <ProjetoFormDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        projeto={projeto}
        clientes={clientes}
        membros={membros}
      />
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={`Excluir projeto de "${projeto.cliente.nome}"?`}
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          await deleteProjeto(projeto.id);
          toast.success("Projeto excluído");
          onOpenChange(false);
        }}
      />
    </>
  );
}
