"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
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
import { cn, formatTelefone } from "@/lib/utils";
import { ETAPA_LEAD_CONFIG, ETAPA_LEAD_ORDEM, ORIGENS_LEAD } from "@/lib/constants";
import { createLead, updateLead } from "@/lib/actions/lead-actions";
import type { Lead } from "@/generated/prisma/client";

type FormState = {
  nome: string;
  empresa: string;
  whatsapp: string;
  instagram: string;
  email: string;
  origem: string;
  valorEstimado: string;
  observacoes: string;
  etapa: string;
};

function emptyState(): FormState {
  return {
    nome: "",
    empresa: "",
    whatsapp: "",
    instagram: "",
    email: "",
    origem: "",
    valorEstimado: "",
    observacoes: "",
    etapa: "NOVO",
  };
}

function fromLead(lead: Lead): FormState {
  return {
    nome: lead.nome,
    empresa: lead.empresa ?? "",
    whatsapp: lead.whatsapp ?? "",
    instagram: lead.instagram ?? "",
    email: lead.email ?? "",
    origem: lead.origem ?? "",
    valorEstimado: lead.valorEstimado != null ? String(lead.valorEstimado) : "",
    observacoes: lead.observacoes ?? "",
    etapa: lead.etapa,
  };
}

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyState());
  const [expandido, setExpandido] = useState(false);
  const [pending, startTransition] = useTransition();
  // Etapa que o lead tinha no momento em que o formulário foi aberto — usada
  // como referência do compare-and-swap no servidor, mesmo que o usuário troque
  // a etapa no Select antes de salvar.
  const [etapaOriginal, setEtapaOriginal] = useState<Lead["etapa"]>("NOVO");

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different record
      setForm(lead ? fromLead(lead) : emptyState());
      setExpandido(!!lead);
      setEtapaOriginal(lead?.etapa ?? "NOVO");
    }
  }, [open, lead]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          valorEstimado: form.valorEstimado ? Number(form.valorEstimado) : null,
          etapa: form.etapa as never,
        };
        if (lead) {
          const result = await updateLead(lead.id, etapaOriginal, payload);
          if (!result.ok) {
            toast.error("Esse lead foi alterado em outro lugar — atualizando com a versão mais recente");
            router.refresh();
            onOpenChange(false);
            return;
          }
          toast.success("Lead atualizado");
        } else {
          await createLead(payload);
          toast.success("Lead criado");
        }
        onOpenChange(false);
      } catch {
        toast.error("Não foi possível salvar o lead");
      }
    });
  }

  const mostrarDetalhes = expandido || !!lead;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{lead ? "Editar lead" : "Novo lead"}</DialogTitle>
            <DialogDescription>
              {lead
                ? "Atualize as informações de contato e o estágio no funil."
                : "Cadastro rápido — complete o resto quando quiser."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  required
                  minLength={2}
                  autoFocus
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  required
                  placeholder="(00) 00000-0000"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", formatTelefone(e.target.value))}
                />
              </div>
            </div>

            {!lead && (
              <button
                type="button"
                onClick={() => setExpandido((v) => !v)}
                className="-mt-1 flex w-fit items-center gap-1 text-xs font-medium text-brand-100 transition-colors hover:text-foreground"
              >
                <ChevronDown className={cn("size-3.5 transition-transform", expandido && "rotate-180")} />
                {expandido ? "Ocultar detalhes" : "Adicionar mais detalhes"}
              </button>
            )}

            <AnimatePresence initial={false}>
              {mostrarDetalhes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="empresa">Empresa</Label>
                        <Input
                          id="empresa"
                          value={form.empresa}
                          onChange={(e) => set("empresa", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={form.instagram}
                          onChange={(e) => set("instagram", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="valor">Valor estimado</Label>
                        <Input
                          id="valor"
                          type="number"
                          min={0}
                          value={form.valorEstimado}
                          onChange={(e) => set("valorEstimado", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="origem">Origem</Label>
                        <Select value={form.origem} onValueChange={(v) => set("origem", v ?? "")}>
                          <SelectTrigger id="origem" className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORIGENS_LEAD.map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="etapa">Etapa</Label>
                        <Select value={form.etapa} onValueChange={(v) => set("etapa", v ?? "NOVO")}>
                          <SelectTrigger id="etapa" className="w-full">
                            <SelectValue>
                              {(value: keyof typeof ETAPA_LEAD_CONFIG) => ETAPA_LEAD_CONFIG[value]?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ETAPA_LEAD_ORDEM.map((etapa) => (
                              <SelectItem key={etapa} value={etapa}>
                                {ETAPA_LEAD_CONFIG[etapa].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : lead ? "Salvar alterações" : "Criar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
