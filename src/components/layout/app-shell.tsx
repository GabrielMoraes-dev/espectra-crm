import { AppSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getConfiguracao } from "@/lib/data/configuracao";
import { verifySession } from "@/lib/auth/session";
import { getPendenciasBadgeCount } from "@/lib/data/dashboard";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [config, session, pendenciasBadge] = await Promise.all([
    getConfiguracao(),
    verifySession(),
    getPendenciasBadgeCount(),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar nomeEmpresa={config.nomeEmpresa} logoUrl={config.logoUrl} pendenciasBadge={pendenciasBadge} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          nomeEmpresa={config.nomeEmpresa}
          logoUrl={config.logoUrl}
          nomeUsuario={session?.nome ?? "Usuário"}
          pendenciasBadge={pendenciasBadge}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
