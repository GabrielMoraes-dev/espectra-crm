"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Link2, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  leadId,
}: {
  cliente: Cliente;
  membros: MembroEquipe[];
  leadId?: string | null;
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openLinks, setOpenLinks] = useState(false);
  const router = useRouter();
  const statusConfig = STATUS_CLIENTE_CONFIG[cliente.status];

  function copiarLink(path: string, mensagem: string) {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    toast.success(mensagem);
    setOpenLinks(false);
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
          {leadId ? (
            <Popover open={openLinks} onOpenChange={setOpenLinks}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="flex h-9 w-[220px] items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground transition-colors hover:bg-accent"
                  />
                }
              >
                Escolha o briefing
                <ChevronDown className="size-4 text-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[280px]">
                <div className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1">
                  <span className="text-sm text-foreground">Briefing inicial (amostra)</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copiarLink(`/formulario/inicial/${leadId}`, "Link do briefing inicial copiado")
                    }
                  >
                    <Link2 className="size-3.5" /> Copiar link
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1">
                  <span className="text-sm text-foreground">Briefing completo</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copiarLink(`/formulario/cliente/${cliente.id}`, "Link do briefing completo copiado")
                    }
                  >
                    <Link2 className="size-3.5" /> Copiar link
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="outline"
              onClick={() =>
                copiarLink(`/formulario/cliente/${cliente.id}`, "Link do briefing completo copiado")
              }
            >
              <Link2 className="size-4" /> Copiar link do briefing
            </Button>
          )}
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
