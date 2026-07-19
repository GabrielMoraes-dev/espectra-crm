"use client";

import { useEffect, useState, useTransition } from "react";
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
import type { MembroEquipe } from "@/generated/prisma/client";
import type { LeadComBriefing } from "@/lib/data/leads";

export function ConvertLeadDialog({
  open,
  onOpenChange,
  lead,
  membros,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadComBriefing | null;
  membros: MembroEquipe[];
}) {
  const [nicho, setNicho] = useState("");
  const [planoContratado, setPlanoContratado] = useState("Landing Page");
  const [valor, setValor] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different lead
      setNicho(lead?.briefingsIniciais[0]?.profissao ?? "");
      setPlanoContratado("Landing Page");
      setValor("");
      setResponsavelId("");
    }
  }, [open, lead]);

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
              <Label htmlFor="planoContratado">Plano contratado</Label>
              <Input id="planoContratado" value={planoContratado} onChange={(e) => setPlanoContratado(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  min={0}
                  placeholder={lead?.valorEstimado ? String(lead.valorEstimado) : "0"}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="responsavelId">Responsável</Label>
                <Select value={responsavelId} onValueChange={(v) => setResponsavelId(v ?? "")}>
                  <SelectTrigger id="responsavelId" className="w-full">
                    <SelectValue placeholder="Selecione">
                      {(value: string) => membros.find((m) => m.id === value)?.nome ?? "Selecione"}
                    </SelectValue>
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
