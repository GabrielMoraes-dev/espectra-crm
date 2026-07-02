import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

const OBJETIVOS = [
  "Agendar consulta",
  "Gerar contato via WhatsApp",
  "Captar leads (formulário)",
  "Vender um serviço/infoproduto",
  "Outro",
];

export function BriefingObjetivoSection({
  form,
  set,
}: {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Qual é o principal objetivo da landing? *</Label>
        <div className="flex flex-wrap gap-2">
          {OBJETIVOS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              aria-pressed={form.objetivo === opcao}
              onClick={() => set("objetivo", opcao)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                form.objetivo === opcao
                  ? "border-brand-500 bg-accent text-brand-100"
                  : "border-border bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cta">
          Qual será o botão principal? *
          <span className="mt-1 block font-normal text-muted-foreground">
            Ex: &quot;Agendar minha consulta&quot;, &quot;Falar no WhatsApp&quot;
          </span>
        </Label>
        <Input
          id="cta"
          required
          placeholder="Texto do botão de ação principal"
          value={form.cta}
          onChange={(e) => set("cta", e.target.value)}
        />
      </div>
    </div>
  );
}
