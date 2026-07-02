import { upload } from "@vercel/blob/client";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export async function uploadImageDirect(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Formato de imagem não suportado");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Imagem muito grande (máx. 8MB)");

  const blob = await upload(`uploads/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
  });

  return blob.url;
}

const MAX_DOCUMENTO_SIZE = 10 * 1024 * 1024;

export async function uploadDocumentoDirect(file: File): Promise<string> {
  const isPdf =
    file.type === "application/pdf" ||
    file.type === "application/octet-stream" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) throw new Error("Envie um arquivo PDF");
  if (file.size > MAX_DOCUMENTO_SIZE) throw new Error("Arquivo muito grande (máx. 10MB)");

  const blob = await upload(`uploads/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
  });

  return blob.url;
}
