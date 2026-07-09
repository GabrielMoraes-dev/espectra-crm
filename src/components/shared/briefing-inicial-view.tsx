import Image from "next/image";
import { formatDateLong } from "@/lib/utils";
import type { BriefingInicial } from "@/generated/prisma/client";

export function BriefingInicialView({ briefingInicial }: { briefingInicial: BriefingInicial }) {
  const fotos = JSON.parse(briefingInicial.fotosUrls) as string[];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-brand-100">Briefing inicial (amostra)</p>
        <p className="text-xs text-muted-foreground">{formatDateLong(briefingInicial.createdAt)}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground">Profissão</p>
        <p className="text-sm text-foreground">{briefingInicial.profissao}</p>
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
                className="relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
