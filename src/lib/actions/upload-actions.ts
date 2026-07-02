"use server";

import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024;

export async function uploadImage(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Arquivo inválido");
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Formato de imagem não suportado");
  if (file.size > MAX_SIZE) throw new Error("Imagem muito grande (máx. 8MB)");

  const ext = file.name.split(".").pop() || "png";
  const filename = `${randomUUID()}.${ext}`;
  const blob = await put(`uploads/${filename}`, file, { access: "public", addRandomSuffix: false });

  return blob.url;
}

const MAX_DOCUMENTO_SIZE = 10 * 1024 * 1024;

export async function uploadDocumento(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Arquivo inválido");
  const isPdf =
    file.type === "application/pdf" ||
    file.type === "application/octet-stream" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) throw new Error("Envie um arquivo PDF");
  if (file.size > MAX_DOCUMENTO_SIZE) throw new Error("Arquivo muito grande (máx. 10MB)");

  const filename = `${randomUUID()}.pdf`;
  const blob = await put(`uploads/${filename}`, file, { access: "public", addRandomSuffix: false });

  return blob.url;
}

const MAX_ARQUIVO_SIZE = 25 * 1024 * 1024;

export async function uploadArquivo(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Arquivo inválido");
  if (file.size > MAX_ARQUIVO_SIZE) throw new Error("Arquivo muito grande (máx. 25MB)");

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${randomUUID()}.${ext}`;
  const blob = await put(`uploads/${filename}`, file, { access: "public", addRandomSuffix: false });

  return blob.url;
}
