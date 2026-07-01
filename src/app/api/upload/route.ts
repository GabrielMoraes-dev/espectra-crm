import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const tipo = formData.get("tipo") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 10MB)" }, { status: 400 });
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.type === "application/octet-stream" ||
      file.name.toLowerCase().endsWith(".pdf");

    const isImage = file.type.startsWith("image/");

    if (tipo === "pdf" && !isPdf) {
      return NextResponse.json({ error: "Envie um arquivo PDF" }, { status: 400 });
    }

    if (tipo === "image" && !isImage) {
      return NextResponse.json({ error: "Envie uma imagem (PNG, JPG, WebP)" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = isPdf ? "pdf" : (file.name.split(".").pop() ?? "bin");
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao salvar arquivo" },
      { status: 500 },
    );
  }
}
