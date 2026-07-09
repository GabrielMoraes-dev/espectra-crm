import Image from "next/image";
import { FileText, Download, File as FileIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { BriefingInicialView } from "@/components/shared/briefing-inicial-view";
import {
  formatDateLong,
  parseResponsabilidades as parseJsonArray,
  isImagemUrl,
} from "@/lib/utils";
import type { Briefing, BriefingInicial } from "@/generated/prisma/client";

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
  const imagens = urls.filter((url) => isImagemUrl(url));
  const outros = urls.filter((url) => !isImagemUrl(url));

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      {imagens.length > 0 && (
        <div className="mt-1 grid grid-cols-4 gap-2">
          {imagens.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              <a
                href={`${url}?download=1`}
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Baixar foto"
              >
                <Download className="size-3" />
              </a>
            </div>
          ))}
        </div>
      )}

      {outros.length > 0 && (
        <ul className="mt-1 space-y-1">
          {outros.map((url) => (
            <li
              key={url}
              className="flex items-center gap-2 rounded-md border border-border bg-card/50 px-2.5 py-1.5 text-xs"
            >
              <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-foreground">{url.split("/").pop()}</span>
              <a
                href={`${url}?download=1`}
                className="ml-auto shrink-0 text-brand-300 hover:text-brand-100"
                aria-label="Baixar arquivo"
              >
                <Download className="size-3.5" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ClienteBriefing({
  briefings,
  briefingInicial,
}: {
  briefings: Briefing[];
  briefingInicial?: BriefingInicial | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Briefing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {briefingInicial && <BriefingInicialView briefingInicial={briefingInicial} />}

        {briefings.length === 0 && !briefingInicial && (
          <EmptyState
            icon={FileText}
            title="Nenhum briefing recebido ainda"
            description="Envie o link do formulário para o cliente preencher."
          />
        )}

        {briefings.length > 0 && (
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-3">
            <p className="text-xs font-medium text-brand-100">Briefing completo</p>
            <div className="space-y-6">
              {briefings.map((b) => (
                <div
                  key={b.id}
                  className="space-y-3 border-b border-border pb-6 last:border-0 last:pb-0"
                >
                  <p className="text-xs text-muted-foreground">{formatDateLong(b.createdAt)}</p>

                  <Campo label="Nome completo" valor={b.nome} />

                  <div className="grid grid-cols-2 gap-3">
                    <Campo label="Profissão" valor={b.profissao} />
                    <Campo label="Registro profissional" valor={b.registroProfissional ?? "—"} />
                  </div>

                  <Campo label="Como quer ser apresentado" valor={b.apresentacao} />
                  <Campo label="História" valor={b.historia} />
                  <Campo label="Especialidades" valor={b.especialidades} />
                  {b.numeroDestaque && <Campo label="Número de destaque" valor={b.numeroDestaque} />}
                  <Campo label="Diferenciais" valor={b.diferenciais} />
                  <Campo label="Por que um cliente procura" valor={b.motivoProcura} />
                  <Campo label="Serviços" valor={b.servicos} />
                  <Campo label="Atendimento" valor={b.atendimento} />

                  {(b.ondeAtende || b.enderecoFisico || b.valoresServicos) && (
                    <div className="grid grid-cols-2 gap-3">
                      {b.ondeAtende && <Campo label="Onde atende" valor={b.ondeAtende} />}
                      {b.enderecoFisico && <Campo label="Endereço físico" valor={b.enderecoFisico} />}
                      {b.valoresServicos && <Campo label="Valores" valor={b.valoresServicos} />}
                    </div>
                  )}

                  {(b.faqAgendamento || b.faqAntesConsulta || b.faqCancelamento || b.faqHorarios) && (
                    <div className="space-y-3 rounded-lg border border-border bg-card/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Perguntas frequentes respondidas
                      </p>
                      {b.faqAgendamento && (
                        <Campo label="Como marcar um horário" valor={b.faqAgendamento} />
                      )}
                      {b.faqAntesConsulta && (
                        <Campo label="O que saber antes da consulta" valor={b.faqAntesConsulta} />
                      )}
                      {b.faqCancelamento && (
                        <Campo label="Política de cancelamento" valor={b.faqCancelamento} />
                      )}
                      {b.faqHorarios && <Campo label="Dias/horários" valor={b.faqHorarios} />}
                    </div>
                  )}

                  {(b.objetivo || b.cta) && (
                    <div className="grid grid-cols-2 gap-3">
                      {b.objetivo && <Campo label="Objetivo da landing" valor={b.objetivo} />}
                      {b.cta && <Campo label="Texto do botão" valor={b.cta} />}
                    </div>
                  )}

                  <Arquivos label="Depoimentos" urls={parseJsonArray(b.depoimentosUrls)} />
                  <Arquivos label="Fotos" urls={parseJsonArray(b.fotosUrls)} />
                  <Arquivos label="Demais arquivos" urls={parseJsonArray(b.arquivosGeraisUrls)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
