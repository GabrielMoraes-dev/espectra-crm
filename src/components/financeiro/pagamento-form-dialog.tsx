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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPagamento, updatePagamento } from "@/lib/actions/pagamento-actions";
import { FORMAS_PAGAMENTO } from "@/lib/constants";
import type { Cliente, Pagamento } from "@/generated/prisma/client";

type FormState = {
  clienteId: string;
  valor: string;
  pago: boolean;
  formaPagamento: string;
  data: string;
};

function emptyState(): FormState {
  return {
    clienteId: "",
    valor: "",
    pago: true,
    formaPagamento: "Pix",
    data: new Date().toISOString().slice(0, 10),
  };
}

function fromPagamento(p: Pagamento): FormState {
  return {
    clienteId: p.clienteId,
    valor: String(p.valor),
    pago: p.pago,
    formaPagamento: p.formaPagamento ?? "",
    data: new Date(p.data).toISOString().slice(0, 10),
  };
}

export function PagamentoFormDialog({
  open,
  onOpenChange,
  pagamento,
  clientes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pagamento?: Pagamento | null;
  clientes: Cliente[];
}) {
  const [form, setForm] = useState<FormState>(emptyState());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different record
    if (open) setForm(pagamento ? fromPagamento(pagamento) : emptyState());
  }, [open, pagamento]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = { ...form, valor: Number(form.valor) };
        if (pagamento) {
          await updatePagamento(pagamento.id, payload);
          toast.success("Pagamento atualizado");
        } else {
          await createPagamento(payload);
          toast.success("Pagamento registrado");
        }
        onOpenChange(false);
      } catch {
        toast.error("Não foi possível salvar o pagamento");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{pagamento ? "Editar pagamento" : "Novo pagamento"}</DialogTitle>
            <DialogDescription>Registre um pagamento vinculado a um cliente.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.clienteId} onValueChange={(v) => set("clienteId", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o cliente">
                    {(value: string) => {
                      const c = clientes.find((c) => c.id === value);
                      return c ? `${c.nome} ${c.empresa ? `· ${c.empresa}` : ""}` : "Selecione o cliente";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} {c.empresa ? `· ${c.empresa}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={form.valor}
                  onChange={(e) => set("valor", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" value={form.data} onChange={(e) => set("data", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Forma de pagamento</Label>
              <Select
                value={form.formaPagamento}
                onValueChange={(v) => set("formaPagamento", v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione">
                    {(value: string) => value || "Selecione"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <Label htmlFor="pago" className="cursor-pointer">Pagamento confirmado</Label>
              <Switch id="pago" checked={form.pago} onCheckedChange={(v) => set("pago", v)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending || !form.clienteId}>
              {pending ? "Salvando..." : pagamento ? "Salvar alterações" : "Registrar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
