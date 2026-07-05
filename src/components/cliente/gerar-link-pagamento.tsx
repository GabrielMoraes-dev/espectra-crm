"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAKTO_LINKS_POR_PRECO } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { gerarLinkPagamento } from "@/lib/actions/pagamento-actions";

const PRECOS = Object.keys(CAKTO_LINKS_POR_PRECO)
  .map(Number)
  .sort((a, b) => a - b);

export function GerarLinkPagamento({ clienteId }: { clienteId: string }) {
  const [preco, setPreco] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGerar() {
    if (!preco) {
      toast.error("Escolhe um preço antes de gerar o link");
      return;
    }
    startTransition(async () => {
      try {
        const url = await gerarLinkPagamento(clienteId, Number(preco));
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
        <Select value={preco} onValueChange={(v) => setPreco(v ?? "")}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Escolha o preço" />
          </SelectTrigger>
          <SelectContent>
            {PRECOS.map((p) => (
              <SelectItem key={p} value={String(p)}>
                {formatCurrency(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
