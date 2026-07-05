"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gerarLinkPagamento } from "@/lib/actions/pagamento-actions";

export function GerarLinkPagamento({ clienteId }: { clienteId: string }) {
  const [valor, setValor] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGerar() {
    const valorNum = Number(valor);
    if (!valorNum || valorNum < 5) {
      toast.error("Informe um valor válido (mínimo R$5)");
      return;
    }
    startTransition(async () => {
      try {
        const url = await gerarLinkPagamento(clienteId, valorNum);
        setLink(url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível gerar o link");
      }
    });
  }

  function copiarLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  }

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">Gerar link de pagamento</p>
      <div className="flex gap-2">
        <Input
          type="number"
          min={5}
          placeholder="Valor (R$)"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={handleGerar} disabled={pending}>
          {pending ? "Gerando..." : "Gerar"}
        </Button>
      </div>
      {link && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-2.5 py-2">
          <p className="flex-1 truncate text-xs text-foreground">{link}</p>
          <Button type="button" size="sm" variant="outline" onClick={copiarLink}>
            Copiar
          </Button>
        </div>
      )}
    </div>
  );
}
