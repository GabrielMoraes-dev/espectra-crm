"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Wallet, CalendarClock, CreditCard } from "lucide-react";
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
import { PagamentoFormDialog } from "@/components/financeiro/pagamento-form-dialog";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { deletePagamento } from "@/lib/actions/pagamento-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Cliente, Pagamento } from "@/generated/prisma/client";

type PagamentoCompleto = Pagamento & { cliente: Cliente };

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

export function PagamentoDetailSheet({
  pagamento,
  open,
  onOpenChange,
  clientes,
}: {
  pagamento: PagamentoCompleto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  if (!pagamento) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {initials(pagamento.cliente.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle>{pagamento.cliente.nome}</SheetTitle>
                <SheetDescription>{pagamento.cliente.empresa || "Sem empresa informada"}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <InfoRow
              icon={Wallet}
              label="Valor"
              value={
                pagamento.desconto
                  ? `${formatCurrency(pagamento.valor)} (${pagamento.desconto}% de desconto)`
                  : formatCurrency(pagamento.valor)
              }
            />
            <InfoRow icon={CalendarClock} label="Data" value={formatDate(pagamento.data)} />
            <InfoRow icon={CreditCard} label="Forma de pagamento" value={pagamento.formaPagamento ?? "—"} />

            <div className="flex items-center gap-2 pt-1">
              <StatusBadge
                label={pagamento.pago ? "Pago" : "Pendente"}
                className={pagamento.pago ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}
              />
            </div>
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

      <PagamentoFormDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        pagamento={pagamento}
        clientes={clientes}
      />
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={`Excluir pagamento de "${pagamento.cliente.nome}"?`}
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          await deletePagamento(pagamento.id);
          toast.success("Pagamento excluído");
          onOpenChange(false);
        }}
      />
    </>
  );
}
