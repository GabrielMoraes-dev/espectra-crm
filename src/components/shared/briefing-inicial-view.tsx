"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BriefingInicialEditDialog } from "@/components/shared/briefing-inicial-edit-dialog";
import { formatDateLong } from "@/lib/utils";
import type { BriefingInicial } from "@/generated/prisma/client";

export function BriefingInicialView({ briefingInicial }: { briefingInicial: BriefingInicial }) {
  const [openEdit, setOpenEdit] = useState(false);
  const fotos = JSON.parse(briefingInicial.fotosUrls) as string[];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-brand-100">Briefing inicial (amostra)</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{formatDateLong(briefingInicial.createdAt)}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setOpenEdit(true)}
            aria-label="Editar briefing inicial"
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground">Nome completo</p>
        <p className="text-sm text-foreground">{briefingInicial.nome}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground">Profissão</p>
        <p className="text-sm text-foreground">{briefingInicial.profissao}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground">Email</p>
        <p className="text-sm text-foreground">{briefingInicial.email}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground">Como quer ser apresentado(a)</p>
        <p className="text-sm whitespace-pre-line text-foreground">{briefingInicial.apresentacao}</p>
      </div>

      {fotos.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Fotos e identidade visual</p>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {fotos.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                <a
                  href={`${url}?download=1`}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Baixar foto"
                >
                  <Download className="size-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <BriefingInicialEditDialog
        briefingInicial={briefingInicial}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />
    </div>
  );
}
