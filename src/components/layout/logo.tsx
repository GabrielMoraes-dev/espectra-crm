import Image from "next/image";
import { cn } from "@/lib/utils";

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
  if (logoUrl && !collapsed) {
    return (
      <div className={cn("flex items-center overflow-hidden", className)}>
        <Image
          src={logoUrl}
          alt={nomeEmpresa}
          width={320}
          height={80}
          className="h-9 w-auto object-contain object-left"
        />
      </div>
    );
  }

  if (logoUrl && collapsed) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden", className)}>
        <Image
          src={logoUrl}
          alt={nomeEmpresa}
          width={320}
          height={80}
          className="h-7 w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5 overflow-hidden", className)}>
      <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-brand-300 to-brand-500 text-sm font-bold text-brand-900 shadow-[0_0_0_1px_var(--border)]">
        {nomeEmpresa.charAt(0).toUpperCase()}
      </div>
      {!collapsed && (
        <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {nomeEmpresa}
        </span>
      )}
    </div>
  );
}
