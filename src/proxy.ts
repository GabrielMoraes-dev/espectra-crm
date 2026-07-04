import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

const PUBLIC_EXACT = ["/login"];
const PUBLIC_PREFIXES = ["/formulario", "/pesquisa", "/api/cron", "/api/webhooks", "/api/blob-upload"];

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const token = request.cookies.get("espectra_session")?.value;
  const session = await decrypt(token);

  if (!session?.usuarioId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|jpg|jpeg|webp)$).*)"],
};
