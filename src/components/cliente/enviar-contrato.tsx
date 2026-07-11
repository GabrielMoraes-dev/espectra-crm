"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAKTO_LINKS_POR_PRECO } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { enviarContrato } from "@/lib/actions/contrato-actions";

const PRECOS = Object.keys(CAKTO_LINKS_POR_PRECO)
  .map(Number)
  .sort((a, b) => a - b);

export function EnviarContrato({
  clienteId,
  cpfCnpj,
  contratoAutentiqueId,
  contratoUrl,
}: {
  clienteId: string;
  cpfCnpj: string | null;
  contratoAutentiqueId: string | null;
  contratoUrl: string | null;
}) {
  const [preco, setPreco] = useState("");
  const [openViewer, setOpenViewer] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleEnviar() {
    if (!preco) {
      toast.error("Escolhe o preço antes de enviar");
      return;
    }
    startTransition(async () => {
      try {
        await enviarContrato(clienteId, Number(preco));
        toast.success("Contrato enviado para assinatura!");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível enviar o contrato");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Contrato</CardTitle>
      </CardHeader>
      <CardContent>
        {contratoUrl ? (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setOpenViewer(true)}
              className="flex size-20 items-center justify-center rounded-lg border border-border bg-card/50 text-muted-foreground transition-colors hover:text-foreground"
            >
              <FileText className="size-8" />
            </button>
            <p className="text-xs text-muted-foreground">Contrato assinado</p>
            <Dialog open={openViewer} onOpenChange={setOpenViewer}>
              <DialogContent className="h-[85vh] max-w-[calc(100%-2rem)] p-0 sm:max-w-3xl">
                <DialogTitle className="sr-only">Contrato assinado</DialogTitle>
                <iframe src={contratoUrl} title="Contrato assinado" className="size-full rounded-xl" />
              </DialogContent>
            </Dialog>
          </div>
        ) : contratoAutentiqueId ? (
          <p className="text-sm text-warning">Aguardando assinatura do cliente...</p>
        ) : !cpfCnpj ? (
          <p className="text-sm text-muted-foreground">
            O cliente ainda não enviou o CPF/CNPJ (isso vem junto com o briefing).
          </p>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label>Preço do contrato</Label>
              <Select value={preco} onValueChange={(v) => setPreco(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha o preço">
                    {(value: string) => (value ? formatCurrency(Number(value)) : "Escolha o preço")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {PRECOS.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {formatCurrency(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" size="sm" onClick={handleEnviar} disabled={pending} className="w-full">
              {pending ? "Enviando..." : "Enviar para assinatura"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
