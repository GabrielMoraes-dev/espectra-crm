"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024;

export async function uploadImage(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Arquivo inválido");
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Formato de imagem não suportado");
  if (file.size > MAX_SIZE) throw new Error("Imagem muito grande (máx. 8MB)");

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop() || "png";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
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

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}
