import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateLong, parseResponsabilidades as parseJsonArray } from "@/lib/utils";
import type { Briefing } from "@/generated/prisma/client";

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-line text-foreground">{valor}</p>
    </div>
  );
}

function Arquivos({ label, urls }: { label: string; urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <ul className="mt-1 space-y-1">
        {urls.map((url) => (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand-300 underline underline-offset-2 hover:text-brand-100"
            >
              {url.split("/").pop()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClienteBriefing({ briefings }: { briefings: Briefing[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Briefing</CardTitle>
      </CardHeader>
      <CardContent>
        {briefings.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum briefing recebido ainda"
            description="Envie o link do formulário para o cliente preencher."
          />
        ) : (
          <div className="space-y-6">
            {briefings.map((b) => (
              <div
                key={b.id}
                className="space-y-3 border-b border-border pb-6 last:border-0 last:pb-0"
              >
                <p className="text-xs text-muted-foreground">{formatDateLong(b.createdAt)}</p>

                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Profissão" valor={b.profissao} />
                  <Campo label="Registro profissional" valor={b.registroProfissional ?? "—"} />
                </div>

                <Campo label="Como quer ser apresentado" valor={b.apresentacao} />
                <Campo label="História" valor={b.historia} />
                <Campo label="Especialidades" valor={b.especialidades} />
                <Campo label="Diferenciais" valor={b.diferenciais} />
                <Campo label="Por que um cliente procura" valor={b.motivoProcura} />
                <Campo label="Serviços" valor={b.servicos} />
                <Campo label="Atendimento" valor={b.atendimento} />

                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Objetivo da landing" valor={b.objetivo} />
                  <Campo label="Texto do botão" valor={b.cta} />
                </div>

                <Arquivos label="Depoimentos" urls={parseJsonArray(b.depoimentosUrls)} />
                <Arquivos label="Fotos" urls={parseJsonArray(b.fotosUrls)} />
                <Arquivos label="Demais arquivos" urls={parseJsonArray(b.arquivosGeraisUrls)} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
