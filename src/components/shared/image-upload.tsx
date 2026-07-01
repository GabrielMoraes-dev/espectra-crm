"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/actions/upload-actions";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  fallback,
  shape = "circle",
}: {
  value: string;
  onChange: (url: string) => void;
  fallback: React.ReactNode;
  shape?: "circle" | "square" | "wide";
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
      const url = await uploadImage(formData);
      onChange(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar a imagem");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-secondary text-secondary-foreground",
          shape === "circle" && "size-16 rounded-full",
          shape === "square" && "size-16 rounded-xl",
          shape === "wide" && "h-16 w-40 rounded-xl",
        )}
      >
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            sizes={shape === "wide" ? "160px" : "64px"}
            className={shape === "wide" ? "object-contain p-2" : "object-cover"}
          />
        ) : (
          fallback
        )}
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Enviando..." : "Enviar imagem"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
