import Image from "next/image";
import { cn } from "@/lib/utils";

const DEFAULT_LOGO = "/logo-espectra.png";

export function Logo({
  collapsed = false,
  className,
  nomeEmpresa = "Espectra",
  logoUrl,
}: {
  collapsed?: boolean;
  className?: string;
  nomeEmpresa?: string;
  logoUrl?: string | null;
}) {
  const src = logoUrl || DEFAULT_LOGO;

  if (!collapsed) {
    return (
      <div className={cn("relative h-10 w-44 shrink-0", className)}>
        <Image
          src={src}
          alt={nomeEmpresa}
          fill
          className="object-contain object-left"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative h-8 w-10 shrink-0", className)}>
      <Image
        src={src}
        alt={nomeEmpresa}
        fill
        className="object-contain"
      />
    </div>
  );
}
