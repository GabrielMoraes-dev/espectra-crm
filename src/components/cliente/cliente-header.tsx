"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Link2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ClienteFormDialog } from "@/components/clientes/cliente-form-dialog";
import { STATUS_CLIENTE_CONFIG } from "@/lib/constants";
import { initials } from "@/lib/utils";
import { deleteCliente } from "@/lib/actions/cliente-actions";
import type { Cliente, MembroEquipe } from "@/generated/prisma/client";

export function ClienteHeader({
  cliente,
  membros,
}: {
  cliente: Cliente;
  membros: MembroEquipe[];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const router = useRouter();
  const statusConfig = STATUS_CLIENTE_CONFIG[cliente.status];

  function copiarLinkBriefing() {
    const url = `${window.location.origin}/formulario/cliente/${cliente.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link do briefing copiado");
  }

  return (
    <div className="space-y-4">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Clientes
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-14">
            <AvatarFallback className="bg-secondary text-base text-secondary-foreground">
              {initials(cliente.nome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{cliente.nome}</h1>
              <StatusBadge label={statusConfig.label} className={statusConfig.className} />
            </div>
            <p className="text-sm text-muted-foreground">{cliente.empresa}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copiarLinkBriefing}>
            <Link2 className="size-4" /> Copiar link do briefing
          </Button>
          <Button variant="outline" onClick={() => setOpenEdit(true)}>
            <Pencil className="size-4" /> Editar cliente
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <ClienteFormDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        cliente={cliente}
        membros={membros}
      />
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={`Excluir cliente "${cliente.nome}"?`}
        description="Essa ação remove também o histórico, projetos e pagamentos vinculados."
        confirmLabel="Excluir"
        onConfirm={async () => {
          await deleteCliente(cliente.id);
          toast.success("Cliente excluído");
          router.push("/clientes");
        }}
      />
    </div>
  );
}
