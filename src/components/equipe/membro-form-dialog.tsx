"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserSquare2 } from "lucide-react";
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
import { ImageUpload } from "@/components/shared/image-upload";
import { createMembro, updateMembro } from "@/lib/actions/membro-actions";
import { parseResponsabilidades, formatTelefone } from "@/lib/utils";
import type { MembroEquipe } from "@/generated/prisma/client";

type FormState = {
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  foto: string;
  responsabilidades: string;
};

function emptyState(): FormState {
  return { nome: "", cargo: "", telefone: "", email: "", foto: "", responsabilidades: "" };
}

function fromMembro(m: MembroEquipe): FormState {
  return {
    nome: m.nome,
    cargo: m.cargo,
    telefone: m.telefone ?? "",
    email: m.email ?? "",
    foto: m.foto ?? "",
    responsabilidades: parseResponsabilidades(m.responsabilidades).join("\n"),
  };
}

export function MembroFormDialog({
  open,
  onOpenChange,
  membro,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membro?: MembroEquipe | null;
}) {
  const [form, setForm] = useState<FormState>(emptyState());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different record
    if (open) setForm(membro ? fromMembro(membro) : emptyState());
  }, [open, membro]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          responsabilidades: form.responsabilidades
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean),
        };
        if (membro) {
          await updateMembro(membro.id, payload);
          toast.success("Membro atualizado");
        } else {
          await createMembro(payload);
          toast.success("Membro adicionado");
        }
        onOpenChange(false);
      } catch {
        toast.error("Não foi possível salvar o membro");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{membro ? "Editar membro" : "Novo membro"}</DialogTitle>
            <DialogDescription>Informações de contato e responsabilidades.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <ImageUpload
              value={form.foto}
              onChange={(url) => set("foto", url)}
              fallback={<UserSquare2 className="size-6" />}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" required value={form.nome} onChange={(e) => set("nome", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input id="cargo" required value={form.cargo} onChange={(e) => set("cargo", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => set("telefone", formatTelefone(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="responsabilidades">Responsabilidades</Label>
              <Textarea
                id="responsabilidades"
                rows={5}
                placeholder={"Uma por linha, ex:\nLanding Pages\nCopywriting"}
                value={form.responsabilidades}
                onChange={(e) => set("responsabilidades", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : membro ? "Salvar alterações" : "Adicionar membro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
