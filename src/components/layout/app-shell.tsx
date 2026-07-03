import { AppSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getConfiguracao } from "@/lib/data/configuracao";
import { verifySession } from "@/lib/auth/session";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [config, session] = await Promise.all([getConfiguracao(), verifySession()]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar nomeEmpresa={config.nomeEmpresa} logoUrl={config.logoUrl} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          nomeEmpresa={config.nomeEmpresa}
          logoUrl={config.logoUrl}
          nomeUsuario={session?.nome ?? "Usuário"}
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
