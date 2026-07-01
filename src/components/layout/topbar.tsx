import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/layout/logo";

export function Topbar({
  nomeEmpresa,
  logoUrl,
}: {
  nomeEmpresa?: string;
  logoUrl?: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <MobileNav nomeEmpresa={nomeEmpresa} logoUrl={logoUrl} />
      <div className="md:hidden">
        <Logo nomeEmpresa={nomeEmpresa} logoUrl={logoUrl} />
      </div>
    </header>
  );
}
