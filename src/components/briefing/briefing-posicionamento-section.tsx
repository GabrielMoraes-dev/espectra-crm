import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

export function BriefingPosicionamentoSection({
  form,
  set,
}: {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="apresentacao">
          Como você gostaria de ser apresentado? *
          <span className="mt-1 block font-normal text-muted-foreground">
            Ex: &quot;Dra. Mariana, nutricionista especialista em emagrecimento sustentável&quot;
          </span>
        </Label>
        <Textarea
          id="apresentacao"
          required
          rows={3}
          placeholder="Descreva como prefere ser chamado(a) e apresentado(a)"
          value={form.apresentacao}
          onChange={(e) => set("apresentacao", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="historia">
          Conte brevemente sua história *
          <span className="mt-1 block font-normal text-muted-foreground">
            Formação, trajetória, o que te trouxe até aqui
          </span>
        </Label>
        <Textarea
          id="historia"
          required
          rows={3}
          placeholder="Sua trajetória profissional em poucas linhas"
          value={form.historia}
          onChange={(e) => set("historia", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="especialidades">Quais são suas especialidades? *</Label>
        <Textarea
          id="especialidades"
          required
          rows={3}
          placeholder="Áreas de atuação, técnicas, abordagens"
          value={form.especialidades}
          onChange={(e) => set("especialidades", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="numeroDestaque">
          Tem algum número que representa bem sua experiência ou resultado?
          <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
          <span className="mt-1 block font-normal text-muted-foreground">
            Ex: anos de atuação, clientes atendidos, taxa de satisfação, prêmio
          </span>
        </Label>
        <Textarea
          id="numeroDestaque"
          rows={3}
          placeholder="Ex: 10 anos de experiência"
          value={form.numeroDestaque}
          onChange={(e) => set("numeroDestaque", e.target.value)}
        />
      </div>
    </div>
  );
}
