import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

export function BriefingDiferenciaisSection({
  form,
  set,
}: {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="diferenciais">O que diferencia você dos concorrentes? *</Label>
        <Textarea
          id="diferenciais"
          required
          rows={3}
          placeholder="Metodologia própria, resultados, formação diferenciada..."
          value={form.diferenciais}
          onChange={(e) => set("diferenciais", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="motivoProcura">
          Por que um cliente procura você? *
          <span className="mt-1 block font-normal text-muted-foreground">
            A dor, necessidade ou desejo que te procuram para resolver
          </span>
        </Label>
        <Textarea
          id="motivoProcura"
          required
          rows={3}
          placeholder="O que leva alguém a te buscar"
          value={form.motivoProcura}
          onChange={(e) => set("motivoProcura", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="servicos">Quais serviços deseja destacar? *</Label>
        <Textarea
          id="servicos"
          required
          rows={3}
          placeholder="Liste os principais serviços ou pacotes"
          value={form.servicos}
          onChange={(e) => set("servicos", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="atendimento">
          Como funciona seu atendimento? *
          <span className="mt-1 block font-normal text-muted-foreground">
            Presencial, online, primeira consulta, duração, processo
          </span>
        </Label>
        <Textarea
          id="atendimento"
          required
          rows={3}
          placeholder="Descreva o fluxo do seu atendimento"
          value={form.atendimento}
          onChange={(e) => set("atendimento", e.target.value)}
        />
      </div>
    </div>
  );
}
