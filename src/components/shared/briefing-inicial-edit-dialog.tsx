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
import { Textarea } from "@/components/ui/textarea";
import { FileField } from "@/components/shared/file-field";
import { updateBriefingInicial } from "@/lib/actions/briefing-inicial-actions";
import type { BriefingInicial } from "@/generated/prisma/client";

export function BriefingInicialEditDialog({
  briefingInicial,
  open,
  onOpenChange,
}: {
  briefingInicial: BriefingInicial;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [nome, setNome] = useState(briefingInicial.nome);
  const [profissao, setProfissao] = useState(briefingInicial.profissao);
  const [email, setEmail] = useState(briefingInicial.email);
  const [apresentacao, setApresentacao] = useState(briefingInicial.apresentacao);
  const [fotosUrls, setFotosUrls] = useState<string[]>(JSON.parse(briefingInicial.fotosUrls));
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateBriefingInicial(briefingInicial.id, { nome, profissao, email, apresentacao, fotosUrls });
        toast.success("Briefing inicial atualizado");
        onOpenChange(false);
        router.refresh();
      } catch {
        toast.error("Não foi possível salvar as alterações");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar briefing inicial</DialogTitle>
            <DialogDescription>
              Aqui no CRM você pode corrigir ou completar o que a pessoa enviou.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="bi-nome">Nome</Label>
              <Input id="bi-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bi-profissao">Profissão</Label>
              <Input
                id="bi-profissao"
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bi-email">Email</Label>
              <Input id="bi-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bi-apresentacao">Como quer ser apresentado(a)</Label>
              <Textarea
                id="bi-apresentacao"
                rows={5}
                value={apresentacao}
                onChange={(e) => setApresentacao(e.target.value)}
              />
            </div>
            <FileField
              label="Fotos e identidade visual"
              accept="image/*"
              urls={fotosUrls}
              onChange={setFotosUrls}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
