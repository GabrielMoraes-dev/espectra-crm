"use client";

import { usePathname } from "next/navigation";

const PUBLIC_PREFIXES = ["/formulario", "/login", "/pesquisa"];

export function ChromeGate({
  shell,
  children,
}: {
  shell: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return isPublic ? <>{children}</> : <>{shell}</>;
}
