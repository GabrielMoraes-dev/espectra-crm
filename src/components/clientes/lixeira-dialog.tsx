"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, RotateCcw, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  getClientesNaLixeira,
  restaurarCliente,
  excluirClientePermanentemente,
} from "@/lib/actions/cliente-actions";
import { formatDate } from "@/lib/utils";
import type { Cliente } from "@/generated/prisma/client";

export function LixeiraButton() {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [alvoExcluir, setAlvoExcluir] = useState<Cliente | null>(null);
  const [, startTransition] = useTransition();

  async function carregar() {
    const lista = await getClientesNaLixeira();
    setClientes(lista);
  }

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (o) carregar();
  }

  function handleRestaurar(cliente: Cliente) {
    startTransition(async () => {
      try {
        await restaurarCliente(cliente.id);
        toast.success(`${cliente.nome} restaurado`);
        carregar();
      } catch {
        toast.error("Não foi possível restaurar o cliente");
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => handleOpenChange(true)}>
        <Trash2 className="size-4" />
        Lixeira
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lixeira de clientes</DialogTitle>
            <DialogDescription>
              Clientes excluídos ficam aqui até serem restaurados ou apagados de vez.
            </DialogDescription>
          </DialogHeader>

          {clientes === null ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : clientes.length === 0 ? (
            <EmptyState icon={Undo2} title="Lixeira vazia" description="Nenhum cliente excluído no momento." />
          ) : (
            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{cliente.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cliente.empresa ? `${cliente.empresa} · ` : ""}excluído em {formatDate(cliente.deletedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleRestaurar(cliente)} title="Restaurar">
                      <RotateCcw className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setAlvoExcluir(cliente)}
                      title="Excluir definitivamente"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!alvoExcluir}
        onOpenChange={(o) => !o && setAlvoExcluir(null)}
        title={`Excluir "${alvoExcluir?.nome}" definitivamente?`}
        description="Não tem como desfazer isso — apaga o cliente, histórico, projetos, pagamentos e arquivos de vez."
        confirmLabel="Excluir de vez"
        onConfirm={async () => {
          if (!alvoExcluir) return;
          await excluirClientePermanentemente(alvoExcluir.id);
          toast.success(`${alvoExcluir.nome} apagado definitivamente`);
          setAlvoExcluir(null);
          carregar();
        }}
      />
    </>
  );
}
