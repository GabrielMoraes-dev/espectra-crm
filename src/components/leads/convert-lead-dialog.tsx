"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NichoField } from "@/components/shared/nicho-field";
import { convertLeadToCliente } from "@/lib/actions/lead-actions";
import type { Lead, MembroEquipe } from "@/generated/prisma/client";

export function ConvertLeadDialog({
  open,
  onOpenChange,
  lead,
  membros,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  membros: MembroEquipe[];
}) {
  const [nicho, setNicho] = useState("");
  const [planoContratado, setPlanoContratado] = useState("Landing Page");
  const [valor, setValor] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;
    startTransition(async () => {
      try {
        const cliente = await convertLeadToCliente(lead.id, {
          nicho,
          planoContratado,
          valor: valor ? Number(valor) : null,
          responsavelId,
        });
        toast.success("Lead convertido em cliente");
        onOpenChange(false);
        router.push(`/clientes/${cliente.id}`);
      } catch {
        toast.error("Não foi possível converter o lead");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Converter em cliente</DialogTitle>
            <DialogDescription>
              {lead?.nome} {lead?.empresa && `(${lead.empresa})`} vai virar um cliente ativo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <NichoField value={nicho} onChange={setNicho} />

            <div className="space-y-1.5">
              <Label>Plano contratado</Label>
              <Input value={planoContratado} onChange={(e) => setPlanoContratado(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder={lead?.valorEstimado ? String(lead.valorEstimado) : "0"}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <Select value={responsavelId} onValueChange={(v) => setResponsavelId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {membros.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Convertendo..." : "Converter em cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
