import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NichoField({
  value,
  onChange,
  label = "Nicho",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="nicho-input">{label}</Label>
      <Input
        id="nicho-input"
        placeholder="Ex.: Corretora de imóveis, Nutricionista, Advogado..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
