"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createPesquisaSatisfacao } from "@/lib/actions/pesquisa-actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPCOES_QUALITATIVAS = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

const PERGUNTAS = [
  { key: "qualidade", label: "Qualidade do resultado final entregue" },
  { key: "comunicacao", label: "Comunicação da equipe durante o projeto" },
  { key: "prazos", label: "Cumprimento dos prazos combinados" },
  { key: "atendimento", label: "Atendimento e suporte que você recebeu" },
] as const;

type PerguntaKey = (typeof PERGUNTAS)[number]["key"];
type Respostas = Record<PerguntaKey, number | null>;

function RatingButtons({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (valor: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPCOES_QUALITATIVAS.map((label, index) => {
        const valor = index + 1;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(valor)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              value === valor
                ? "border-brand-300 bg-brand-300 text-brand-900"
                : "border-input text-foreground hover:border-brand-300",
            )}
            aria-pressed={value === valor}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function PesquisaForm({
  clienteId,
  onEnviado,
}: {
  clienteId: string;
  onEnviado: () => void;
}) {
  const [respostas, setRespostas] = useState<Respostas>({
    qualidade: null,
    comunicacao: null,
    prazos: null,
    atendimento: null,
  });
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (PERGUNTAS.some((p) => !respostas[p.key])) {
      toast.error("Responde todas as perguntas antes de enviar.");
      return;
    }
    if (!nota) {
      toast.error("Escolhe uma nota antes de enviar.");
      return;
    }

    startTransition(async () => {
      try {
        await createPesquisaSatisfacao({
          clienteId,
          qualidade: respostas.qualidade!,
          comunicacao: respostas.comunicacao!,
          prazos: respostas.prazos!,
          atendimento: respostas.atendimento!,
          nota,
          comentario,
        });
        onEnviado();
      } catch {
        toast.error("Não foi possível enviar sua avaliação. Tenta de novo?");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {PERGUNTAS.map((pergunta) => (
        <div key={pergunta.key} className="grid gap-2">
          <p className="text-sm font-medium text-foreground">{pergunta.label}</p>
          <RatingButtons
            value={respostas[pergunta.key]}
            onChange={(valor) => setRespostas((prev) => ({ ...prev, [pergunta.key]: valor }))}
          />
        </div>
      ))}

      <div className="grid gap-2 border-t border-border pt-6">
        <p className="text-sm font-medium text-foreground">
          De 1 a 5, o quanto você recomendaria a Espectra?
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => setNota(valor)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                nota === valor
                  ? "border-brand-300 bg-brand-300 text-brand-900"
                  : "border-input text-foreground hover:border-brand-300",
              )}
              aria-pressed={nota === valor}
            >
              {valor}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Não recomendaria</span>
          <span>Recomendaria muito</span>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="comentario" className="text-sm font-medium text-foreground">
          Quer deixar algum comentário? (opcional)
        </label>
        <Textarea
          id="comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Conta pra gente como foi a experiência..."
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar avaliação"}
      </Button>
    </form>
  );
}
