"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createBriefing } from "@/lib/actions/briefing-actions";
import { BriefingIdentificacaoSection } from "@/components/briefing/briefing-identificacao-section";
import { BriefingPosicionamentoSection } from "@/components/briefing/briefing-posicionamento-section";
import { BriefingDiferenciaisSection } from "@/components/briefing/briefing-diferenciais-section";
import { BriefingObjetivoSection } from "@/components/briefing/briefing-objetivo-section";
import { BriefingArquivosSection } from "@/components/briefing/briefing-arquivos-section";
import { BriefingProgress } from "@/components/briefing/briefing-progress";
import { BriefingSuccess } from "@/components/briefing/briefing-success";
import { Button } from "@/components/ui/button";

export type BriefingFormState = {
  leadId: string;
  clienteId: string;
  nome: string;
  profissao: string;
  cidade: string;
  estado: string;
  email: string;
  whatsapp: string;
  instagram: string;
  registroProfissional: string;
  apresentacao: string;
  historia: string;
  especialidades: string;
  diferenciais: string;
  motivoProcura: string;
  servicos: string;
  atendimento: string;
  objetivo: string;
  cta: string;
  depoimentosUrls: string[];
  fotosUrls: string[];
  arquivosGeraisUrls: string[];
};

export type BriefingInitialData = {
  leadId?: string;
  clienteId?: string;
  nome?: string;
  empresa?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  email?: string | null;
  cidade?: string | null;
  estado?: string | null;
  nicho?: string | null;
};

function emptyState(initialData?: BriefingInitialData): BriefingFormState {
  return {
    leadId: initialData?.leadId ?? "",
    clienteId: initialData?.clienteId ?? "",
    nome: initialData?.nome ?? "",
    profissao: initialData?.nicho ?? "",
    cidade: initialData?.cidade ?? "",
    estado: initialData?.estado ?? "",
    email: initialData?.email ?? "",
    whatsapp: initialData?.whatsapp ?? "",
    instagram: initialData?.instagram ?? "",
    registroProfissional: "",
    apresentacao: "",
    historia: "",
    especialidades: "",
    diferenciais: "",
    motivoProcura: "",
    servicos: "",
    atendimento: "",
    objetivo: "",
    cta: "",
    depoimentosUrls: [],
    fotosUrls: [],
    arquivosGeraisUrls: [],
  };
}

const SECTIONS: { titulo: string; sub: string; campos: (keyof BriefingFormState)[] }[] = [
  {
    titulo: "Identificação",
    sub: "Quem é o profissional por trás da marca.",
    campos: ["nome", "profissao", "cidade", "email", "whatsapp"],
  },
  {
    titulo: "Como você quer ser percebido",
    sub: "A base do posicionamento: a história que sustenta a autoridade.",
    campos: ["apresentacao", "historia", "especialidades"],
  },
  {
    titulo: "Diferenciais e proposta de valor",
    sub: "O que faz o mercado escolher você — e não outro profissional.",
    campos: ["diferenciais", "motivoProcura", "servicos", "atendimento"],
  },
  {
    titulo: "Objetivo da landing page",
    sub: "Para onde queremos guiar quem visita a página.",
    campos: ["objetivo", "cta"],
  },
  {
    titulo: "Materiais e arquivos",
    sub: "Tudo que dá corpo visual à sua autoridade.",
    campos: ["arquivosGeraisUrls"],
  },
];

const TOTAL_REQUIRED = SECTIONS.reduce((acc, s) => acc + s.campos.length, 0);

function isFilled(form: BriefingFormState, campo: keyof BriefingFormState) {
  const v = form[campo];
  if (Array.isArray(v)) return v.length > 0;
  return v.trim() !== "";
}

export function BriefingForm({ initialData }: { initialData?: BriefingInitialData }) {
  const [form, setForm] = useState<BriefingFormState>(() => emptyState(initialData));
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const answered = SECTIONS.flatMap((s) => s.campos).filter((c) => isFilled(form, c)).length;
  const currentStepIndex = SECTIONS.findIndex((s) => s.campos.some((c) => !isFilled(form, c)));
  const step = currentStepIndex === -1 ? SECTIONS.length : currentStepIndex + 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createBriefing(form);
        setDone(true);
      } catch {
        toast.error("Não foi possível enviar o briefing. Confira os campos obrigatórios.");
      }
    });
  }

  if (done) return <BriefingSuccess />;

  return (
    <form onSubmit={handleSubmit}>
      <header>
        <p className="text-[11px] font-semibold tracking-[.22em] text-brand-300 uppercase">
          Posicionamento Digital
        </p>
        <h1 className="font-heading mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Sua autoridade já existe.
          <br />
          <span className="text-brand-300">Vamos fazer com que ela seja percebida.</span>
        </h1>
        <p className="mt-4 max-w-lg text-sm text-muted-foreground">
          Este formulário reúne tudo o que precisamos para construir sua landing page com
          profundidade estratégica — sem te cansar com dezenas de perguntas.{" "}
          <strong className="text-foreground">Leva cerca de 10 minutos.</strong>
        </p>
        <BriefingProgress
          answered={answered}
          total={TOTAL_REQUIRED}
          step={step}
          totalSteps={SECTIONS.length}
        />
      </header>

      <section className="mt-16">
        <SectionHead numero="01" titulo={SECTIONS[0].titulo} sub={SECTIONS[0].sub} />
        <BriefingIdentificacaoSection form={form} set={set} />
      </section>

      <section className="mt-16">
        <SectionHead numero="02" titulo={SECTIONS[1].titulo} sub={SECTIONS[1].sub} />
        <BriefingPosicionamentoSection form={form} set={set} />
      </section>

      <section className="mt-16">
        <SectionHead numero="03" titulo={SECTIONS[2].titulo} sub={SECTIONS[2].sub} />
        <BriefingDiferenciaisSection form={form} set={set} />
      </section>

      <section className="mt-16">
        <SectionHead numero="04" titulo={SECTIONS[3].titulo} sub={SECTIONS[3].sub} />
        <BriefingObjetivoSection form={form} set={set} />
      </section>

      <section className="mt-16">
        <SectionHead numero="05" titulo={SECTIONS[4].titulo} sub={SECTIONS[4].sub} />
        <BriefingArquivosSection form={form} set={set} />
      </section>

      <footer className="mt-16 border-t border-border pt-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Ao enviar, nossa equipe analisa seu briefing e retorna em até 2 dias úteis com os
          próximos passos.
        </p>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Enviando..." : "Enviar briefing"}
        </Button>
      </footer>
    </form>
  );
}

function SectionHead({ numero, titulo, sub }: { numero: string; titulo: string; sub: string }) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="flex items-baseline gap-3.5">
        <span className="font-heading text-lg font-semibold text-brand-300">{numero}</span>
        <span className="font-heading text-xl font-semibold text-foreground">{titulo}</span>
      </div>
      <p className="mt-1 text-[13.5px] text-muted-foreground">{sub}</p>
    </div>
  );
}
