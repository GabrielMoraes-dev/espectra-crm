import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_BRASIL } from "@/lib/constants";
import type { BriefingFormState } from "@/components/briefing/briefing-form";

export function BriefingIdentificacaoSection({
  form,
  set,
}: {
  form: BriefingFormState;
  set: <K extends keyof BriefingFormState>(key: K, value: BriefingFormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome completo *</Label>
        <Input
          id="nome"
          required
          placeholder="Como você se chama"
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="profissao">Profissão *</Label>
          <Input
            id="profissao"
            required
            placeholder="Ex: Nutricionista, Advogado..."
            value={form.profissao}
            onChange={(e) => set("profissao", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            required
            placeholder="Ex: Pelotas"
            value={form.cidade}
            onChange={(e) => set("cidade", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select value={form.estado} onValueChange={(v) => set("estado", v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BRASIL.map((e) => (
                <SelectItem key={e.uf} value={e.uf}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="registroProfissional">
            Registro profissional
            <span className="ml-1 font-normal text-muted-foreground">(se houver)</span>
          </Label>
          <Input
            id="registroProfissional"
            placeholder="Ex: CRM 12345-SP"
            value={form.registroProfissional}
            onChange={(e) => set("registroProfissional", e.target.value)}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Número do seu conselho de classe — CRM, CRECI, OAB, CRN, CRP, CRO, CREA, CAU etc.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp *</Label>
          <Input
            id="whatsapp"
            type="tel"
            required
            placeholder="(00) 00000-0000"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instagram">Instagram</Label>
        <Input
          id="instagram"
          placeholder="@seuusuario"
          value={form.instagram}
          onChange={(e) => set("instagram", e.target.value)}
        />
      </div>
    </div>
  );
}
