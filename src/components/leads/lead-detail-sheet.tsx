"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, ArrowRightLeft, Phone, AtSign, Mail, Tag, Wallet, Link2 } from "lucide-react";
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
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { ConvertLeadDialog } from "@/components/leads/convert-lead-dialog";
import { ETAPA_LEAD_CONFIG } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteLead, registrarLinkCopiado } from "@/lib/actions/lead-actions";
import { BriefingInicialView } from "@/components/shared/briefing-inicial-view";
import type { MembroEquipe } from "@/generated/prisma/client";
import type { LeadComBriefing } from "@/lib/data/leads";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-100">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  membros,
}: {
  lead: LeadComBriefing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membros: MembroEquipe[];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openConvert, setOpenConvert] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  if (!lead) return null;

  const etapaConfig = ETAPA_LEAD_CONFIG[lead.etapa];
  const podeConverter = !lead.clienteId && lead.etapa !== "PERDIDO";
  const podeEnviarBriefing = lead.etapa !== "PERDIDO";
  const leadId = lead.id;

  function copiarLinkBriefing() {
    const url = `${window.location.origin}/formulario/lead/${leadId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link do briefing copiado");
    registrarLinkCopiado(leadId);
  }

  function copiarLinkBriefingInicial() {
    const url = `${window.location.origin}/formulario/inicial/${leadId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link do briefing inicial copiado");
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle>{lead.nome}</SheetTitle>
              <StatusBadge label={etapaConfig.label} className={etapaConfig.className} />
            </div>
            <SheetDescription>{lead.empresa || "Sem empresa informada"}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <InfoRow icon={Phone} label="WhatsApp" value={lead.whatsapp ?? "—"} />
            <InfoRow icon={AtSign} label="Instagram" value={lead.instagram ?? "—"} />
            <InfoRow icon={Mail} label="Email" value={lead.email ?? "—"} />
            <InfoRow icon={Tag} label="Origem" value={lead.origem ?? "—"} />
            <InfoRow icon={Wallet} label="Valor estimado" value={formatCurrency(lead.valorEstimado)} />

            {podeEnviarBriefing && (
              <div className="grid gap-2">
                <Button variant="outline" className="w-full" onClick={copiarLinkBriefingInicial}>
                  <Link2 className="size-4" /> Copiar link do briefing inicial (amostra)
                </Button>
                <Button variant="outline" className="w-full" onClick={copiarLinkBriefing}>
                  <Link2 className="size-4" /> Copiar link do briefing completo
                </Button>
              </div>
            )}

            {lead.briefingsIniciais[0] && (
              <BriefingInicialView briefingInicial={lead.briefingsIniciais[0]} />
            )}

            {lead.observacoes && (
              <div className="space-y-1 rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">Observações</p>
                <p className="text-sm text-foreground">{lead.observacoes}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Criado em {formatDate(lead.createdAt)}
            </p>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpenEdit(true)}>
              <Pencil className="size-4" /> Editar
            </Button>
            {podeConverter && (
              <Button variant="outline" className="flex-1" onClick={() => setOpenConvert(true)}>
                <ArrowRightLeft className="size-4" /> Converter
              </Button>
            )}
            <Button variant="destructive" size="icon" onClick={() => setOpenDelete(true)}>
              <Trash2 className="size-4" />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <LeadFormDialog open={openEdit} onOpenChange={setOpenEdit} lead={lead} />
      <ConvertLeadDialog open={openConvert} onOpenChange={setOpenConvert} lead={lead} membros={membros} />
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={`Excluir lead "${lead.nome}"?`}
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          await deleteLead(lead.id);
          toast.success("Lead excluído");
          onOpenChange(false);
        }}
      />
    </>
  );
}
