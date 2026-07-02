"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, X, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadArquivo } from "@/lib/actions/upload-actions";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

function FileField({
  label,
  hint,
  required,
  accept,
  urls,
  onChange,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const novasUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const url = await uploadArquivo(formData);
        novasUrls.push(url);
      }
      onChange([...urls, ...novasUrls]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o arquivo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    onChange(urls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-brand-300">*</span>}
        {hint && <span className="mt-1 block font-normal text-muted-foreground">{hint}</span>}
      </Label>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {uploading ? "Enviando..." : "Escolher arquivos"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={handleFiles}
      />

      {urls.length > 0 && (
        <ul className="mt-1 space-y-1">
          {urls.map((url) => (
            <li
              key={url}
              className="flex items-center gap-2 rounded-md border border-border bg-card/50 px-2.5 py-1.5 text-xs text-muted-foreground"
            >
              <FileIcon className="size-3.5 shrink-0" />
              <span className="truncate">{url.split("/").pop()}</span>
              <button
                type="button"
                onClick={() => remove(url)}
                className="ml-auto shrink-0 rounded p-0.5 hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BriefingArquivosSection({
  form,
  set,
}: {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
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
        hint="JPG ou PNG, alta resolução"
        accept="image/*"
        urls={form.fotosUrls}
        onChange={(urls) => set("fotosUrls", urls)}
      />

      <FileField
        label="Demais arquivos"
        hint="Logo, identidade visual, vídeos, depoimentos e outros materiais"
        required
        urls={form.arquivosGeraisUrls}
        onChange={(urls) => set("arquivosGeraisUrls", urls)}
      />
    </div>
  );
}
