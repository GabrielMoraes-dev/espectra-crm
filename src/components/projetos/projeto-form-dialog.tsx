"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ETAPA_PROJETO_CONFIG, ETAPA_PROJETO_ORDEM } from "@/lib/constants";
import { createProjeto, updateProjeto } from "@/lib/actions/projeto-actions";
import type { Cliente, MembroEquipe, Projeto } from "@/generated/prisma/client";

type FormState = {
  clienteId: string;
  prazo: string;
  responsavelId: string;
  status: string;
  observacoes: string;
};

function emptyState(): FormState {
  return { clienteId: "", prazo: "", responsavelId: "", status: "BRIEFING", observacoes: "" };
}

function fromProjeto(p: Projeto): FormState {
  return {
    clienteId: p.clienteId,
    prazo: p.prazo ? new Date(p.prazo).toISOString().slice(0, 10) : "",
    responsavelId: p.responsavelId ?? "",
    status: p.status,
    observacoes: p.observacoes ?? "",
  };
}

export function ProjetoFormDialog({
  open,
  onOpenChange,
  projeto,
  clientes,
  membros,
  clienteIdFixo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto?: Projeto | null;
  clientes?: Cliente[];
  membros: MembroEquipe[];
  clienteIdFixo?: string;
}) {
  const [form, setForm] = useState<FormState>(emptyState());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different record
    if (open) setForm(projeto ? fromProjeto(projeto) : { ...emptyState(), clienteId: clienteIdFixo ?? "" });
  }, [open, projeto, clienteIdFixo]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = { ...form, status: form.status as never };
        if (projeto) {
          await updateProjeto(projeto.id, payload);
          toast.success("Projeto atualizado");
        } else {
          await createProjeto(payload);
          toast.success("Projeto criado");
        }
        onOpenChange(false);
      } catch {
        toast.error("Não foi possível salvar o projeto");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{projeto ? "Editar projeto" : "Novo projeto"}</DialogTitle>
            <DialogDescription>Vincule o projeto a um cliente e defina a etapa atual.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!clienteIdFixo && (
              <div className="space-y-1.5">
                <Label htmlFor="clienteId">Cliente *</Label>
                <Select value={form.clienteId} onValueChange={(v) => set("clienteId", v ?? "")}>
                  <SelectTrigger id="clienteId" className="w-full">
                    <SelectValue placeholder="Selecione o cliente">
                      {(value: string) => {
                        const c = clientes?.find((c) => c.id === value);
                        return c ? `${c.nome} ${c.empresa ? `· ${c.empresa}` : ""}` : "Selecione o cliente";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome} {c.empresa ? `· ${c.empresa}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prazo">Prazo</Label>
                <Input id="prazo" type="date" value={form.prazo} onChange={(e) => set("prazo", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="responsavelId">Responsável</Label>
                <Select value={form.responsavelId} onValueChange={(v) => set("responsavelId", v ?? "")}>
                  <SelectTrigger id="responsavelId" className="w-full">
                    <SelectValue placeholder="Selecione">
                      {(value: string) => membros.find((m) => m.id === value)?.nome ?? "Selecione"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {membros.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Etapa</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v ?? "BRIEFING")}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: keyof typeof ETAPA_PROJETO_CONFIG) => ETAPA_PROJETO_CONFIG[value]?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ETAPA_PROJETO_ORDEM.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>
                      {ETAPA_PROJETO_CONFIG[etapa].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                rows={3}
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending || !form.clienteId}>
              {pending ? "Salvando..." : projeto ? "Salvar alterações" : "Criar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
