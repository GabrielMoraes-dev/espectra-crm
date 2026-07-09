"use client";

import { FileField } from "@/components/shared/file-field";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

export function BriefingArquivosSection({
  form,
  set,
  fotosLocked,
}: {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
  fotosLocked?: string[];
}) {
  return (
    <div className="space-y-5">
      <FileField
        label="Depoimentos ou resultados"
        hint="Prints, vídeos ou textos"
        urls={form.depoimentosUrls}
        onChange={(urls) => set("depoimentosUrls", urls)}
      />

      <FileField
        label="Fotos profissionais"
        hint="JPG ou PNG, alta resolução — pode adicionar quantas fotos novas quiser"
        accept="image/*"
        urls={form.fotosUrls}
        onChange={(urls) => set("fotosUrls", urls)}
        lockedUrls={fotosLocked}
      />

      <FileField
        label="Demais arquivos"
        hint="Logo, identidade visual, vídeos, depoimentos e outros materiais"
        urls={form.arquivosGeraisUrls}
        onChange={(urls) => set("arquivosGeraisUrls", urls)}
      />
    </div>
  );
}
