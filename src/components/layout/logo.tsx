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
      <div className={cn("flex items-center overflow-hidden", className)}>
        <Image
          src={src}
          alt={nomeEmpresa}
          width={320}
          height={80}
          className="h-10 w-auto object-contain object-left"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center overflow-hidden", className)}>
      <Image
        src={src}
        alt={nomeEmpresa}
        width={320}
        height={80}
        className="h-8 w-auto object-contain"
      />
    </div>
  );
}
