"use client";

import { FileField } from "@/components/shared/file-field";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

export function BriefingArquivosSection({
  form,
  set,
  fotosLocked,
  demo,
}: {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
  fotosLocked?: string[];
  demo?: boolean;
}) {
  return (
    <div className="space-y-5">
      <FileField
        label="Depoimentos ou resultados"
        hint="Prints, vídeos ou textos — até 1GB por arquivo"
        permiteVideo
        urls={form.depoimentosUrls}
        onChange={(urls) => set("depoimentosUrls", urls)}
        demo={demo}
      />

      <FileField
        label="Fotos profissionais"
        hint="JPG ou PNG, alta resolução — pode adicionar quantas fotos novas quiser"
        accept="image/*"
        urls={form.fotosUrls}
        onChange={(urls) => set("fotosUrls", urls)}
        lockedUrls={fotosLocked}
        demo={demo}
      />

      <FileField
        label="Demais arquivos"
        hint="Logo, identidade visual, vídeos, depoimentos e outros materiais — até 1GB por arquivo"
        permiteVideo
        urls={form.arquivosGeraisUrls}
        onChange={(urls) => set("arquivosGeraisUrls", urls)}
        demo={demo}
      />
    </div>
  );
}
