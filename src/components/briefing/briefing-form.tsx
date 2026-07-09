"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createBriefing } from "@/lib/actions/briefing-actions";
import { BriefingIdentificacaoSection } from "@/components/briefing/briefing-identificacao-section";
import { BriefingPosicionamentoSection } from "@/components/briefing/briefing-posicionamento-section";
import { BriefingDiferenciaisSection } from "@/components/briefing/briefing-diferenciais-section";
import { BriefingArquivosSection } from "@/components/briefing/briefing-arquivos-section";
import { BriefingProgress } from "@/components/briefing/briefing-progress";
import { BriefingSuccess } from "@/components/briefing/briefing-success";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  cpfCnpj: string;
  registroProfissional: string;
  apresentacao: string;
  historia: string;
  especialidades: string;
  numeroDestaque: string;
  diferenciais: string;
  motivoProcura: string;
  servicos: string;
  atendimento: string;
  ondeAtende: string;
  enderecoFisico: string;
  valoresServicos: string;
  faqAgendamento: string;
  faqAntesConsulta: string;
  faqCancelamento: string;
  faqHorarios: string;
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
  nomeInicial?: string | null;
  profissaoInicial?: string | null;
  apresentacao?: string | null;
  fotosUrls?: string[];
};

function emptyState(initialData?: BriefingInitialData): BriefingFormState {
  return {
    leadId: initialData?.leadId ?? "",
    clienteId: initialData?.clienteId ?? "",
    nome: initialData?.nomeInicial ?? initialData?.nome ?? "",
    profissao: initialData?.profissaoInicial ?? initialData?.nicho ?? "",
    cidade: initialData?.cidade ?? "",
    estado: initialData?.estado ?? "",
    email: initialData?.email ?? "",
    whatsapp: initialData?.whatsapp ?? "",
    instagram: initialData?.instagram ?? "",
    cpfCnpj: "",
    registroProfissional: "",
    apresentacao: initialData?.apresentacao ?? "",
    historia: "",
    especialidades: "",
    numeroDestaque: "",
    diferenciais: "",
    motivoProcura: "",
    servicos: "",
    atendimento: "",
    ondeAtende: "",
    enderecoFisico: "",
    valoresServicos: "",
    faqAgendamento: "",
    faqAntesConsulta: "",
    faqCancelamento: "",
    faqHorarios: "",
    depoimentosUrls: [],
    fotosUrls: initialData?.fotosUrls ?? [],
    arquivosGeraisUrls: [],
  };
}

type SectionProps = {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
  identificacaoLocked?: boolean;
  fotosLocked?: string[];
};

const SECTIONS: {
  titulo: string;
  sub: string;
  campos: (keyof BriefingFormState)[];
  Component: (props: SectionProps) => React.ReactElement;
}[] = [
  {
    titulo: "Identificação",
    sub: "Quem é o profissional por trás da marca.",
    campos: ["nome", "profissao", "cidade", "email", "whatsapp", "cpfCnpj"],
    Component: BriefingIdentificacaoSection,
  },
  {
    titulo: "Como você quer ser percebido",
    sub: "A base do posicionamento: a história que sustenta a autoridade.",
    campos: ["apresentacao", "historia", "especialidades"],
    Component: BriefingPosicionamentoSection,
  },
  {
    titulo: "Diferenciais e proposta de valor",
    sub: "O que faz o mercado escolher você — e não outro profissional.",
    campos: ["diferenciais", "motivoProcura", "servicos", "atendimento"],
    Component: BriefingDiferenciaisSection,
  },
  {
    titulo: "Materiais e arquivos",
    sub: "Tudo que dá corpo visual à sua autoridade.",
    campos: [],
    Component: BriefingArquivosSection,
  },
];

const TOTAL_REQUIRED = SECTIONS.reduce((acc, s) => acc + s.campos.length, 0);

function isFilled(form: BriefingFormState, campo: keyof BriefingFormState) {
  const v = form[campo];
  if (Array.isArray(v)) return v.length > 0;
  return v.trim() !== "";
}

export function BriefingForm({
  initialData,
  demo,
}: {
  initialData?: BriefingInitialData;
  demo?: boolean;
}) {
  const [form, setForm] = useState<BriefingFormState>(() => emptyState(initialData));
  const [done, setDone] = useState(false);
  const [openSemArquivos, setOpenSemArquivos] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const answered = SECTIONS.flatMap((s) => s.campos).filter((c) => isFilled(form, c)).length;
  const currentStepIndex = SECTIONS.findIndex((s) => s.campos.some((c) => !isFilled(form, c)));
  const step = currentStepIndex === -1 ? SECTIONS.length : currentStepIndex + 1;
  const identificacaoLocked = Boolean(initialData?.profissaoInicial);
  const fotosLocked = initialData?.fotosUrls ?? [];

  function focarPrimeiroCampoInvalido() {
    for (const section of SECTIONS) {
      for (const campo of section.campos) {
        if (!isFilled(form, campo)) {
          const el = document.getElementById(campo);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          (el as HTMLElement | null)?.focus();
          toast.error("Preencha os campos obrigatórios antes de enviar.");
          return true;
        }
      }
    }
    return false;
  }

  function enviarBriefing() {
    if (demo) {
      toast.message("Isso é só uma demonstração — nada foi enviado de verdade.");
      setDone(true);
      return;
    }
    startTransition(async () => {
      try {
        await createBriefing(form);
        setDone(true);
      } catch {
        toast.error("Não foi possível enviar o briefing. Confira os campos obrigatórios.");
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (focarPrimeiroCampoInvalido()) return;

    const semArquivos =
      form.depoimentosUrls.length === 0 &&
      form.fotosUrls.length === 0 &&
      form.arquivosGeraisUrls.length === 0;
    if (semArquivos) {
      setOpenSemArquivos(true);
      return;
    }
    enviarBriefing();
  }

  if (done) return <BriefingSuccess />;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <header>
        <div className="relative mb-8 h-9 w-36">
          <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain object-left" />
        </div>
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

      {SECTIONS.map((section, i) => (
        <section key={section.titulo} className="mt-16">
          <SectionHead
            numero={String(i + 1).padStart(2, "0")}
            titulo={section.titulo}
            sub={section.sub}
          />
          <section.Component
            form={form}
            set={set}
            identificacaoLocked={identificacaoLocked}
            fotosLocked={fotosLocked}
          />
        </section>
      ))}

      <footer className="mt-16 border-t border-border pt-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Ao enviar, nossa equipe analisa seu briefing e retorna em até 2 dias úteis com os
          próximos passos.
        </p>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Enviando..." : "Enviar briefing"}
        </Button>
      </footer>

      <Dialog open={openSemArquivos} onOpenChange={setOpenSemArquivos}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tem certeza que não quer adicionar mais nada?</DialogTitle>
            <DialogDescription>
              Quanto mais fotos, depoimentos e materiais você enviar, melhor fica o resultado da
              sua página.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenSemArquivos(false)}>
              Voltar e adicionar
            </Button>
            <Button
              type="button"
              onClick={() => {
                setOpenSemArquivos(false);
                enviarBriefing();
              }}
              disabled={pending}
            >
              {pending ? "Enviando..." : "Enviar mesmo assim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
