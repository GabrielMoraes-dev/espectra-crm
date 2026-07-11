"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  vincularPagamentoSemMatch,
  descartarPagamentoSemMatch,
} from "@/lib/actions/pagamento-sem-match-actions";
import type { DashboardData } from "@/lib/data/dashboard";

export function PagamentosSemMatchCard({
  pagamentos,
  clientes,
}: {
  pagamentos: DashboardData["pagamentosSemMatch"];
  clientes: DashboardData["clientesParaVincular"];
}) {
  const [alvo, setAlvo] = useState<DashboardData["pagamentosSemMatch"][number] | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (pagamentos.length === 0) return null;

  function handleVincular() {
    if (!alvo || !clienteId) {
      toast.error("Escolhe um cliente antes de vincular");
      return;
    }
    startTransition(async () => {
      try {
        await vincularPagamentoSemMatch(alvo.id, clienteId);
        toast.success("Pagamento vinculado ao cliente");
        setAlvo(null);
        setClienteId("");
        router.refresh();
      } catch {
        toast.error("Não foi possível vincular o pagamento");
      }
    });
  }

  function handleDescartar(id: string) {
    startTransition(async () => {
      try {
        await descartarPagamentoSemMatch(id);
        toast.success("Descartado");
        router.refresh();
      } catch {
        toast.error("Não foi possível descartar");
      }
    });
  }

  return (
    <>
      <Card className="border-warning/30">
        <CardContent className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <HelpCircle className="size-4 text-warning" />
            Pagamentos sem cliente correspondente
          </p>
          <ul className="space-y-2">
            {pagamentos.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.nome} — {formatCurrency(p.valor)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.email} · {p.telefone}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDescartar(p.id)} disabled={pending}>
                    Descartar
                  </Button>
                  <Button size="sm" onClick={() => setAlvo(p)} disabled={pending}>
                    Vincular
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={!!alvo} onOpenChange={(o) => !o && setAlvo(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Vincular pagamento</DialogTitle>
            <DialogDescription>
              {alvo && `${alvo.nome} — ${formatCurrency(alvo.valor)}`}
            </DialogDescription>
          </DialogHeader>
          <Select value={clienteId} onValueChange={(v) => setClienteId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha o cliente">
                {(value: string) => clientes.find((c) => c.id === value)?.nome ?? "Escolha o cliente"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleVincular} disabled={pending}>
              {pending ? "Vinculando..." : "Vincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
