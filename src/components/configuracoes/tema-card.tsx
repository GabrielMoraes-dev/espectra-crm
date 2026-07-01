import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PALETA = ["#021024", "#052659", "#5483B3", "#7DA0CA", "#C1E8FF"];

export function TemaCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Tema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-xl border border-brand-500/40 bg-accent/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-full ring-1 ring-border">
              {PALETA.map((cor) => (
                <span key={cor} className="size-4" style={{ backgroundColor: cor }} />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Dark Navy</p>
              <p className="text-xs text-muted-foreground">Tema padrão da Espectra</p>
            </div>
          </div>
          <div className="flex size-6 items-center justify-center rounded-full bg-brand-500 text-primary-foreground">
            <Check className="size-3.5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Novos temas (claro, alto contraste) chegam em uma próxima versão.
        </p>
      </CardContent>
    </Card>
  );
}
