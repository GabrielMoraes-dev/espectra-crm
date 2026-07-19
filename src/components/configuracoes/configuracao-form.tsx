"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/image-upload";
import { updateConfiguracao } from "@/lib/actions/configuracao-actions";
import type { ConfiguracaoEmpresa } from "@/generated/prisma/client";

export function ConfiguracaoForm({ config }: { config: ConfiguracaoEmpresa }) {
  const [nomeEmpresa, setNomeEmpresa] = useState(config.nomeEmpresa);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl ?? "");
  const [sobre, setSobre] = useState(config.sobre ?? "");
  const [metaFaturamentoMensal, setMetaFaturamentoMensal] = useState(
    config.metaFaturamentoMensal != null ? String(config.metaFaturamentoMensal) : "",
  );
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateConfiguracao(config.id, {
          nomeEmpresa,
          logoUrl,
          sobre,
          metaFaturamentoMensal: metaFaturamentoMensal.trim() === "" ? null : Number(metaFaturamentoMensal),
        });
        toast.success("Configurações salvas");
      } catch {
        toast.error("Não foi possível salvar as configurações");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Identidade e informações gerais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Logo</Label>
            <ImageUpload
              value={logoUrl}
              onChange={setLogoUrl}
              fallback={<Building2 className="size-6" />}
              shape="wide"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nomeEmpresa">Nome da empresa</Label>
            <Input
              id="nomeEmpresa"
              required
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sobre">Sobre a empresa</Label>
            <Textarea
              id="sobre"
              rows={3}
              placeholder="Uma breve descrição da Espectra."
              value={sobre}
              onChange={(e) => setSobre(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="metaFaturamentoMensal">Meta de faturamento mensal (R$)</Label>
            <Input
              id="metaFaturamentoMensal"
              type="number"
              min={0}
              step={1}
              placeholder="Ex: 15000"
              value={metaFaturamentoMensal}
              onChange={(e) => setMetaFaturamentoMensal(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
