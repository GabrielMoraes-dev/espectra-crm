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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIPO_INTERACAO_LEAD_CONFIG, TIPO_INTERACAO_LEAD_ORDEM } from "@/lib/constants";
import { registrarInteracaoLead } from "@/lib/actions/lead-actions";

type TipoInteracao = (typeof TIPO_INTERACAO_LEAD_ORDEM)[number];

function isTipoInteracao(v: string): v is TipoInteracao {
  return (TIPO_INTERACAO_LEAD_ORDEM as readonly string[]).includes(v);
}

export function RegistrarInteracaoDialog({
  open,
  onOpenChange,
  leadId,
  leadNome,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadNome: string;
}) {
  const [tipo, setTipo] = useState<TipoInteracao>("WHATSAPP");
  const [observacao, setObservacao] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta o formulário toda vez que o diálogo abre
      setTipo("WHATSAPP");
      setObservacao("");
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await registrarInteracaoLead(leadId, { tipo, observacao });
        toast.success("Interação registrada");
        onOpenChange(false);
      } catch {
        toast.error("Não foi possível registrar a interação");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar interação</DialogTitle>
            <DialogDescription>Marca o último contato comercial real com {leadNome}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="tipoInteracao">Tipo de contato</Label>
              <Select
                value={tipo}
                onValueChange={(v) => {
                  if (v && isTipoInteracao(v)) setTipo(v);
                }}
              >
                <SelectTrigger id="tipoInteracao" className="w-full">
                  <SelectValue>
                    {(value: typeof tipo) => TIPO_INTERACAO_LEAD_CONFIG[value]?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIPO_INTERACAO_LEAD_ORDEM.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_INTERACAO_LEAD_CONFIG[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observacaoInteracao">Observação (opcional)</Label>
              <Textarea
                id="observacaoInteracao"
                rows={3}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
