import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Filosofia() {
  return (
    <Card className="border-brand-500/30 bg-gradient-to-br from-accent/60 to-transparent">
      <CardContent className="flex gap-4">
        <Quote className="size-8 shrink-0 text-brand-300" />
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Filosofia</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A Espectra trabalha com divisão clara de responsabilidades entre os dois sócios — um
            cuida inteiramente da produção, o outro do relacionamento comercial. Essa separação
            garante maior qualidade em cada entrega, mais velocidade no fluxo entre etapas e uma
            operação organizada o suficiente para crescer sem perder padrão.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
