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
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/shared/image-upload";
import { createLinkInterno, updateLinkInterno } from "@/lib/actions/link-actions";
import type { LinkInterno } from "@/generated/prisma/client";

export function LinkFormDialog({
  open,
  onOpenChange,
  link,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: LinkInterno | null;
}) {
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [icone, setIcone] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form whenever the dialog opens for a different record
      setNome(link?.nome ?? "");
      setUrl(link?.url ?? "");
      setIcone(link?.icone ?? "");
    }
  }, [open, link]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (link) {
          await updateLinkInterno(link.id, { nome, url, icone });
          toast.success("Link atualizado");
        } else {
          await createLinkInterno({ nome, url, icone });
          toast.success("Link adicionado");
        }
        onOpenChange(false);
      } catch {
        toast.error("Não foi possível salvar o link");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{link ? "Editar link" : "Novo link"}</DialogTitle>
            <DialogDescription>Atalho para uma ferramenta usada pela equipe.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">URL *</Label>
              <Input id="url" required placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ícone (opcional)</Label>
              <ImageUpload value={icone} onChange={setIcone} fallback={<Link2 className="size-5" />} shape="square" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : link ? "Salvar alterações" : "Adicionar link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
