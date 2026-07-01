import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, getPrazoUrgencia } from "@/lib/utils";
import type { Cliente } from "@/generated/prisma/client";

export function PrazoAlertBanner({ clientes }: { clientes: Cliente[] }) {
  const itens = clientes
    .map((cliente) => ({ cliente, urgencia: getPrazoUrgencia(cliente.prazo) }))
    .filter((item): item is { cliente: Cliente; urgencia: NonNullable<ReturnType<typeof getPrazoUrgencia>> } =>
      item.urgencia !== null,
    )
    .sort((a, b) => new Date(a.cliente.prazo!).getTime() - new Date(b.cliente.prazo!).getTime());

  if (itens.length === 0) return null;

  return (
    <Card className="border-warning/30">
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CalendarClock className="size-4 text-warning" />
          Prazos de entrega próximos
        </p>
        <ul className="space-y-2">
          {itens.map(({ cliente, urgencia }) => (
            <li
              key={cliente.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5"
            >
              <Link
                href={`/clientes/${cliente.id}`}
                className="min-w-0 truncate text-sm font-medium text-foreground hover:text-brand-100"
              >
                {cliente.empresa ?? cliente.nome}
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatDate(cliente.prazo)}</span>
                <StatusBadge label={urgencia.label} className={urgencia.className} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
