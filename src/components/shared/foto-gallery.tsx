"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageDirect } from "@/lib/upload-client";
import { addFotoCliente, deleteFotoCliente } from "@/lib/actions/cliente-actions";
import type { FotoCliente } from "@/generated/prisma/client";

export function FotoGallery({
  clienteId,
  fotos,
}: {
  clienteId: string;
  fotos: FotoCliente[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(fotos);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadImageDirect(file);
        const foto = await addFotoCliente(clienteId, url);
        setItems((prev) => [foto, ...prev]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar a foto");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(foto: FotoCliente) {
    setItems((prev) => prev.filter((f) => f.id !== foto.id));
    try {
      await deleteFotoCliente(foto.id, clienteId);
    } catch {
      toast.error("Não foi possível excluir a foto");
      setItems((prev) => [foto, ...prev]);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Fotos para a landing page {items.length > 0 && `· ${items.length}`}
        </p>
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Enviando..." : "Adicionar fotos"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((foto) => (
            <div
              key={foto.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card/50"
            >
              <Image src={foto.url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(foto)}
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
