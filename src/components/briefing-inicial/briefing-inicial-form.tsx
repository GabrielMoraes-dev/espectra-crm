"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createBriefingInicial } from "@/lib/actions/briefing-inicial-actions";
import { BriefingInicialSuccess } from "@/components/briefing-inicial/briefing-inicial-success";
import { FileField } from "@/components/shared/file-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function BriefingInicialForm({
  leadId,
  nomeInicial,
  emailInicial,
  demo,
}: {
  leadId: string;
  nomeInicial: string;
  emailInicial: string;
  demo?: boolean;
}) {
  const [nome, setNome] = useState(nomeInicial);
  const [profissao, setProfissao] = useState("");
  const [email, setEmail] = useState(emailInicial);
  const [apresentacao, setApresentacao] = useState("");
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [pending, startTransition] = useTransition();

  function focarCampoInvalido(id: string, mensagem: string) {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
    toast.error(mensagem);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      focarCampoInvalido("nome", "Preencha seu nome completo.");
      return;
    }
    if (!profissao.trim()) {
      focarCampoInvalido("profissao", "Preencha sua profissão.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      focarCampoInvalido("email", "Informe um email válido.");
      return;
    }
    if (!apresentacao.trim()) {
      focarCampoInvalido("apresentacao", "Conte como você quer ser apresentado(a).");
      return;
    }
    if (fotosUrls.length === 0) {
      toast.error("Envie ao menos uma foto ou sua logo antes de continuar.");
      return;
    }
    if (demo) {
      toast.message("Isso é só uma demonstração — nada foi enviado de verdade.");
      setEnviado(true);
      return;
    }
    startTransition(async () => {
      try {
        await createBriefingInicial({ leadId, nome, profissao, email, apresentacao, fotosUrls });
        setEnviado(true);
      } catch {
        toast.error("Não foi possível enviar. Confira os campos e tente de novo.");
      }
    });
  }

  if (enviado) {
    return <BriefingInicialSuccess />;
  }

  return (
    <>
      <div className="relative mx-auto mb-8 h-9 w-36">
        <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain" />
      </div>
      <h1 className="font-heading text-center text-2xl font-semibold text-foreground">
        Vamos montar sua amostra gratuita
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">
        Só precisamos de algumas informações básicas pra criar uma prévia da sua página.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome completo *</Label>
          <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profissao">
            Profissão *
            <span className="ml-1 font-normal text-muted-foreground">
              (inclua sua especialidade, se tiver)
            </span>
          </Label>
          <Input
            id="profissao"
            required
            placeholder="Ex: Nutricionista - Especialista em emagrecimento"
            value={profissao}
            onChange={(e) => setProfissao(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email *
            <span className="ml-1 font-normal text-muted-foreground">
              (vamos usar pra te avisar sobre o andamento do seu projeto)
            </span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apresentacao">Como você quer ser apresentado(a)? *</Label>
          <Textarea
            id="apresentacao"
            required
            rows={6}
            placeholder="Conte bastante sobre você, sua trajetória e seu trabalho — quanto mais detalhes, melhor fica a sua amostra"
            value={apresentacao}
            onChange={(e) => setApresentacao(e.target.value)}
          />
        </div>

        <FileField
          label="Fotos, logo e identidade visual"
          hint="Envie no máximo 6 arquivos ao todo: fotos profissionais suas, fotos do lugar onde você trabalha, sua logo e identidade visual, se tiver."
          required
          accept="image/*"
          max={6}
          urls={fotosUrls}
          onChange={setFotosUrls}
        />

        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </>
  );
}
