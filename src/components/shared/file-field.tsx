"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { Upload, Loader2, X, Lock, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isImagemUrl } from "@/lib/utils";
import { comprimirImagem } from "@/lib/image-compress";

const LIMITE_PADRAO_MB = 20;
const LIMITE_GERAL_MB = 1024;

export function FileField({
  label,
  hint,
  required,
  accept,
  urls,
  onChange,
  lockedUrls,
  max,
  permiteVideo,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  lockedUrls?: string[];
  max?: number;
  /** Permite vídeo e arquivos maiores (até 1GB) — sem isso, só imagem/PDF até 20MB. */
  permiteVideo?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const atingiuLimite = max !== undefined && urls.length >= max;
  const limiteMb = permiteVideo ? LIMITE_GERAL_MB : LIMITE_PADRAO_MB;
  const limiteLabel = limiteMb >= 1024 ? `${limiteMb / 1024}GB` : `${limiteMb}MB`;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (max !== undefined && urls.length + files.length > max) {
      toast.error(`Envie no máximo ${max} arquivos.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      // Fotos de celular vêm com vários MB — comprimir antes acelera muito o
      // envio em conexão móvel, onde o upload costuma ser bem mais lento que o download.
      const preparados = await Promise.all(
        files.map((file) => (file.type.startsWith("image/") ? comprimirImagem(file) : file)),
      );

      const limiteBytes = limiteMb * 1024 * 1024;
      const grandeDemais = preparados.find((f) => f.size > limiteBytes);
      if (grandeDemais) {
        toast.error(`"${grandeDemais.name}" é maior que o limite de ${limiteLabel}.`);
        return;
      }

      const novasUrls = await Promise.all(
        preparados.map((file) =>
          upload(`uploads/${crypto.randomUUID()}-${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/blob-upload",
            clientPayload: JSON.stringify({ tipo: permiteVideo ? "geral" : "padrao" }),
          }).then((blob) => blob.url),
        ),
      );
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

  const imagens = urls.filter((url) => isImagemUrl(url));
  const outros = urls.filter((url) => !isImagemUrl(url));

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
        disabled={uploading || atingiuLimite}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {uploading ? "Enviando..." : atingiuLimite ? `Limite de ${max} atingido` : "Escolher arquivos"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={handleFiles}
      />

      {imagens.length > 0 && (
        <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imagens.map((url) => {
            const locked = lockedUrls?.includes(url) ?? false;
            return (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card/50"
              >
                <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                {locked ? (
                  <div className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-muted-foreground">
                    <Lock className="size-3" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => remove(url)}
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {outros.length > 0 && (
        <ul className="mt-1 space-y-1">
          {outros.map((url) => {
            const locked = lockedUrls?.includes(url) ?? false;
            return (
              <li
                key={url}
                className="flex items-center gap-2 rounded-md border border-border bg-card/50 px-2.5 py-1.5 text-xs text-muted-foreground"
              >
                <FileIcon className="size-3.5 shrink-0" />
                <span className="truncate">{url.split("/").pop()}</span>
                {locked ? (
                  <Lock className="ml-auto size-3.5 shrink-0" />
                ) : (
                  <button
                    type="button"
                    onClick={() => remove(url)}
                    className="ml-auto shrink-0 rounded p-0.5 hover:text-danger"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
