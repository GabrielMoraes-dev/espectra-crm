"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembroFormDialog } from "@/components/equipe/membro-form-dialog";

export function EquipeToolbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Novo membro
      </Button>
      <MembroFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
