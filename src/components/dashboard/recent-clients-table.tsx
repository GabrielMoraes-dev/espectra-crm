import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { STATUS_CLIENTE_CONFIG } from "@/lib/constants";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import type { DashboardData } from "@/lib/data/dashboard";

export function RecentClientsTable({
  clientes,
}: {
  clientes: DashboardData["clientesRecentes"];
}) {
  if (clientes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum cliente cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {clientes.map((cliente) => {
        const statusConfig = STATUS_CLIENTE_CONFIG[cliente.status];
        return (
          <Link
            key={cliente.id}
            href={`/clientes/${cliente.id}`}
            className="flex items-center gap-3 py-3 transition-colors hover:bg-accent/40 -mx-2 px-2 rounded-lg"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {initials(cliente.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{cliente.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{cliente.empresa}</p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(cliente.valor)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(cliente.dataEntrada)}
              </p>
            </div>
            <StatusBadge label={statusConfig.label} className={statusConfig.className} />
          </Link>
        );
      })}
    </div>
  );
}
