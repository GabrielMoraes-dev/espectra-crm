"use client";

import { useEffect, useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatTelefone } from "@/lib/utils";
import { ESTADOS_BRASIL, STATUS_CLIENTE_CONFIG } from "@/lib/constants";
import { NichoField } from "@/components/shared/nicho-field";
import { FileUpload } from "@/components/shared/file-upload";
import { createCliente, updateCliente } from "@/lib/actions/cliente-actions";
import type { Cliente, MembroEquipe } from "@/generated/prisma/client";

type FormState = {
  nome: string;
  empresa: string;
  whatsapp: string;
  instagram: string;
  email: string;
  site: string;
  cidade: string;
  estado: string;
  nicho: string;
  planoContratado: string;
  valor: string;
  responsavelId: string;
  prazo: string;
  status: string;
  contratoUrl: string;
};

function emptyState(): FormState {
  return {
    nome: "",
    empresa: "",
    whatsapp: "",
    instagram: "",
    email: "",
    site: "",
    cidade: "",
    estado: "",
    nicho: "",
    planoContratado: "",
    valor: "",
    responsavelId: "",
    prazo: "",
    status: "EM_PRODUCAO",
    contratoUrl: "",
  };
}

function fromCliente(c: Cliente): FormState {
  return {
    nome: c.nome,
    empresa: c.empresa ?? "",
    whatsapp: c.whatsapp ?? "",
    instagram: c.instagram ?? "",
    email: c.email ?? "",
    site: c.site ?? "",
    cidade: c.cidade ?? "",
    estado: c.estado ?? "",
    nicho: c.nicho ?? "",
    planoContratado: c.planoContratado ?? "",
    valor: c.valor != null ? String(c.valor) : "",
    responsavelId: c.responsavelId ?? "",
    prazo: c.prazo ? new Date(c.prazo).toISOString().slice(0, 10) : "",
    status: c.status,
    contratoUrl: c.contratoUrl ?? "",
  };
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
  membros,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  membros: MembroEquipe[];
}) {
  const [form, setForm] = useState<FormState>(emptyState());
  const [expandido, setExpandido] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different record
      setForm(cliente ? fromCliente(cliente) : emptyState());
      setExpandido(!!cliente);
    }
  }, [open, cliente]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          valor: form.valor ? Number(form.valor) : null,
          status: form.status as never,
        };
        if (cliente) {
          await updateCliente(cliente.id, payload);
        } else {
          await createCliente(payload);
        }
        toast.success(cliente ? "Cliente atualizado" : "Cliente criado");
        onOpenChange(false);
      } catch (err) {
        toast.error(String(err));
      }
    });
  }

  const mostrarDetalhes = expandido || !!cliente;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{cliente ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>
              {cliente
                ? "Informações de contato e contrato."
                : "Cadastro rápido — complete o resto quando quiser."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" required minLength={2} autoFocus value={form.nome} onChange={(e) => set("nome", e.target.value)} />
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

            {!cliente && (
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
                        <Input id="empresa" value={form.empresa} onChange={(e) => set("empresa", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="site">Site pronto</Label>
                        <Input id="site" placeholder="https://" value={form.site} onChange={(e) => set("site", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input id="cidade" placeholder="Ex: São Paulo" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="estado">Estado</Label>
                        <Select value={form.estado} onValueChange={(v) => set("estado", v ?? "")}>
                          <SelectTrigger id="estado" className="w-full">
                            <SelectValue placeholder="Selecione o UF">
                              {(value: string) => {
                                const e = ESTADOS_BRASIL.find((e) => e.uf === value);
                                return e ? `${e.uf} — ${e.nome}` : "Selecione o UF";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS_BRASIL.map((e) => (
                              <SelectItem key={e.uf} value={e.uf}>
                                {e.uf} — {e.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <NichoField value={form.nicho} onChange={(v) => set("nicho", v)} />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="valor">Valor</Label>
                        <Input id="valor" type="number" min={0} value={form.valor} onChange={(e) => set("valor", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="prazo">Prazo</Label>
                        <Input id="prazo" type="date" value={form.prazo} onChange={(e) => set("prazo", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                      <div className="space-y-1.5">
                        <Label htmlFor="status">Status</Label>
                        <Select value={form.status} onValueChange={(v) => set("status", v ?? "EM_PRODUCAO")}>
                          <SelectTrigger id="status" className="w-full">
                            <SelectValue>
                              {(value: string) =>
                                STATUS_CLIENTE_CONFIG[value as keyof typeof STATUS_CLIENTE_CONFIG]?.label
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CLIENTE_CONFIG).map(([key, cfg]) => (
                              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Contrato (PDF)</Label>
                      <FileUpload value={form.contratoUrl} onChange={(url) => set("contratoUrl", url)} label="Enviar contrato" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : cliente ? "Salvar alterações" : "Criar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
