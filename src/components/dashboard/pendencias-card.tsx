import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DashboardData } from "@/lib/data/dashboard";

const LABELS = {
  pagou_sem_contrato: { label: "Pagou, falta assinar", className: "bg-warning/20 text-warning" },
  assinou_sem_pagar: { label: "Assinou, falta pagar", className: "bg-warning/20 text-warning" },
};

export function PendenciasCard({
  pendencias,
}: {
  pendencias: DashboardData["pendenciasContratoPagamento"];
}) {
  if (pendencias.length === 0) return null;

  return (
    <Card className="border-warning/30">
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <AlertCircle className="size-4 text-warning" />
          Pendências de pagamento/contrato
        </p>
        <ul className="space-y-2">
          {pendencias.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5"
            >
              <Link
                href={`/clientes/${item.id}`}
                className="min-w-0 truncate text-sm font-medium text-foreground hover:text-brand-100"
              >
                {item.empresa ?? item.nome}
              </Link>
              <StatusBadge label={LABELS[item.tipo].label} className={LABELS[item.tipo].className} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
