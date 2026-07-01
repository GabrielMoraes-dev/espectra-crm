"use client";

import { useState } from "react";
import { FileText, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SOPEditDialog } from "@/components/estrutura/sop-edit-dialog";
import type { SOP } from "@/generated/prisma/client";

function SOPCard({ sop }: { sop: SOP }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-100">
              <FileText className="size-4" />
            </div>
            <p className="text-sm font-medium text-foreground">{sop.titulo}</p>
          </div>
          <p className="line-clamp-3 min-h-[3.75rem] text-sm text-muted-foreground">
            {sop.conteudo || "Ainda sem conteúdo. Documente o passo a passo deste processo."}
          </p>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="self-start">
            <Pencil className="size-3.5" />
            {sop.conteudo ? "Editar" : "Adicionar conteúdo"}
          </Button>
        </CardContent>
      </Card>
      <SOPEditDialog open={open} onOpenChange={setOpen} sop={sop} />
    </>
  );
}

export function SOPsGrid({ sops }: { sops: SOP[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Procedimentos Operacionais Padrão</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sops.map((sop) => (
          <SOPCard key={sop.id} sop={sop} />
        ))}
      </CardContent>
    </Card>
  );
}
