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
import { Textarea } from "@/components/ui/textarea";
import { updateSOP } from "@/lib/actions/sop-actions";
import type { SOP } from "@/generated/prisma/client";

export function SOPEditDialog({
  open,
  onOpenChange,
  sop,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sop: SOP;
}) {
  const [conteudo, setConteudo] = useState(sop.conteudo ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the field whenever the dialog opens for a different SOP
    if (open) setConteudo(sop.conteudo ?? "");
  }, [open, sop.conteudo]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateSOP(sop.id, { conteudo });
      toast.success("Procedimento salvo");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{sop.titulo}</DialogTitle>
            <DialogDescription>
              Descreva o passo a passo padrão para este processo.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              rows={10}
              placeholder="Ex: 1. Receber o lead. 2. Responder em até 1h. 3. ..."
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
