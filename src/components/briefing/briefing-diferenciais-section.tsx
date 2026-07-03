import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

const ONDE_ATENDE_OPCOES = ["Presencial", "Online", "Presencial e online"];

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

      <div className="space-y-2">
        <Label>
          Onde você atende?
          <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {ONDE_ATENDE_OPCOES.map((opcao) => (
            <button
              key={opcao}
              type="button"
              aria-pressed={form.ondeAtende === opcao}
              onClick={() => set("ondeAtende", opcao)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                form.ondeAtende === opcao
                  ? "border-brand-500 bg-accent text-brand-100"
                  : "border-border bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>

      {form.ondeAtende !== "Online" && (
        <div className="space-y-1.5">
          <Label htmlFor="enderecoFisico">
            Endereço físico
            <span className="ml-1 font-normal text-muted-foreground">
              (opcional — se você atender presencialmente)
            </span>
          </Label>
          <Input
            id="enderecoFisico"
            placeholder="Rua, número, bairro, cidade"
            value={form.enderecoFisico}
            onChange={(e) => set("enderecoFisico", e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="valoresServicos">
          Quanto custam seus serviços?
          <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
          <span className="mt-1 block font-normal text-muted-foreground">
            Só preencha se quiser mostrar valores na landing page
          </span>
        </Label>
        <Input
          id="valoresServicos"
          placeholder="Ex: consulta a partir de R$150, ou combine no WhatsApp"
          value={form.valoresServicos}
          onChange={(e) => set("valoresServicos", e.target.value)}
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-[13px] font-medium text-foreground">
          Perguntas que seus clientes costumam ter
          <span className="ml-1 font-normal text-muted-foreground">
            (opcional — responda só o que quiser)
          </span>
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="faqAgendamento">Como funciona pra marcar um horário com você?</Label>
            <Textarea
              id="faqAgendamento"
              rows={2}
              value={form.faqAgendamento}
              onChange={(e) => set("faqAgendamento", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faqAntesConsulta">
              Tem algo que a pessoa precisa saber ou levar antes da primeira consulta/reunião?
            </Label>
            <Textarea
              id="faqAntesConsulta"
              rows={2}
              value={form.faqAntesConsulta}
              onChange={(e) => set("faqAntesConsulta", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faqCancelamento">
              Qual sua política de cancelamento ou remarcação?
            </Label>
            <Textarea
              id="faqCancelamento"
              rows={2}
              value={form.faqCancelamento}
              onChange={(e) => set("faqCancelamento", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faqHorarios">Quais dias/horários você atende?</Label>
            <Textarea
              id="faqHorarios"
              rows={2}
              value={form.faqHorarios}
              onChange={(e) => set("faqHorarios", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
