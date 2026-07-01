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
import {
  PRIORIDADE_TAREFA_CONFIG,
  STATUS_TAREFA_CONFIG,
  STATUS_TAREFA_ORDEM,
} from "@/lib/constants";
import { createTarefa, updateTarefa } from "@/lib/actions/tarefa-actions";
import type { MembroEquipe, Tarefa } from "@/generated/prisma/client";

type FormState = {
  titulo: string;
  descricao: string;
  responsavelId: string;
  prazo: string;
  prioridade: string;
  status: string;
};

function emptyState(): FormState {
  return { titulo: "", descricao: "", responsavelId: "", prazo: "", prioridade: "MEDIA", status: "A_FAZER" };
}

function fromTarefa(t: Tarefa): FormState {
  return {
    titulo: t.titulo,
    descricao: t.descricao ?? "",
    responsavelId: t.responsavelId ?? "",
    prazo: t.prazo ? new Date(t.prazo).toISOString().slice(0, 10) : "",
    prioridade: t.prioridade,
    status: t.status,
  };
}

export function TarefaFormDialog({
  open,
  onOpenChange,
  tarefa,
  membros,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarefa?: Tarefa | null;
  membros: MembroEquipe[];
}) {
  const [form, setForm] = useState<FormState>(emptyState());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different record
    if (open) setForm(tarefa ? fromTarefa(tarefa) : emptyState());
  }, [open, tarefa]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = { ...form, prioridade: form.prioridade as never, status: form.status as never };
        if (tarefa) {
          await updateTarefa(tarefa.id, payload);
          toast.success("Tarefa atualizada");
        } else {
          await createTarefa(payload);
          toast.success("Tarefa criada");
        }
        onOpenChange(false);
      } catch {
        toast.error("Não foi possível salvar a tarefa");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{tarefa ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
            <DialogDescription>Defina o responsável, o prazo e a prioridade.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" required value={form.titulo} onChange={(e) => set("titulo", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="O que precisa ser feito..."
                rows={3}
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <Select value={form.responsavelId} onValueChange={(v) => set("responsavelId", v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {membros.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prazo">Prazo</Label>
                <Input id="prazo" type="date" value={form.prazo} onChange={(e) => set("prazo", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v ?? "MEDIA")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORIDADE_TAREFA_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v ?? "A_FAZER")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_TAREFA_ORDEM.map((status) => (
                      <SelectItem key={status} value={status}>{STATUS_TAREFA_CONFIG[status].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : tarefa ? "Salvar alterações" : "Criar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
