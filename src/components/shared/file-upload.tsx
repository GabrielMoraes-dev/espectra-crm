"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUpload({
  value,
  onChange,
  label = "Enviar PDF",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", "pdf");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Falha no upload");
      onChange(json.url as string);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o arquivo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center gap-2 truncate rounded-lg border border-border bg-card/50 px-3 py-2 text-sm font-medium text-foreground hover:text-brand-100"
        >
          <FileText className="size-4 shrink-0" />
          Ver contrato
        </a>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        </Button>
        <Button type="button" variant="outline" size="icon-sm" onClick={() => onChange("")}>
          <X className="size-3.5" />
        </Button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {uploading ? "Enviando..." : label}
      </Button>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFile} />
    </div>
  );
}
