"use server";

import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/auth/session";

const MAX_DOCUMENTO_SIZE = 10 * 1024 * 1024;

export async function uploadDocumento(formData: FormData) {
  await requireAuth();
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
