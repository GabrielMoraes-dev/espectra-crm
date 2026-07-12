const MAX_DIMENSAO = 1920;
const QUALIDADE = 0.82;
const TAMANHO_MINIMO_PARA_COMPRIMIR = 400 * 1024;

/**
 * Fotos de celular costumam vir com vários MB cada, o que deixa o upload
 * lento em conexões móveis (upload é bem mais lento que download no 4G).
 * Redimensiona pro maior lado ter no máximo 1920px e reexporta em JPEG,
 * o que normalmente reduz o arquivo em 5-15x sem perda visível de qualidade.
 * Se qualquer coisa falhar, devolve o arquivo original em vez de travar o envio.
 */
export async function comprimirImagem(file: File): Promise<File> {
  if (file.type === "image/gif" || file.size < TAMANHO_MINIMO_PARA_COMPRIMIR) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const escala = Math.min(1, MAX_DIMENSAO / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    // PNG pode ter fundo transparente (ex.: logo) — reexportar como JPEG
    // apagaria a transparência, preenchendo com preto. Nesse caso mantém PNG.
    const preservarTransparencia = file.type === "image/png";
    const tipoSaida = preservarTransparencia ? "image/png" : "image/jpeg";
    const qualidade = preservarTransparencia ? undefined : QUALIDADE;

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipoSaida, qualidade));
    if (!blob || blob.size >= file.size) return file;

    const extensao = preservarTransparencia ? ".png" : ".jpg";
    const novoNome = file.name.replace(/\.[^.]+$/, "") + extensao;
    return new File([blob], novoNome, { type: tipoSaida });
  } catch {
    return file;
  }
}
