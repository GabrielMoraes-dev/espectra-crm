import { ArrowDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FLUXO_OPERACIONAL } from "@/lib/constants";

export function FluxoOperacional() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Fluxo Operacional</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          {FLUXO_OPERACIONAL.map((etapa, i) => (
            <div key={etapa} className="flex items-center gap-2">
              <span className="whitespace-nowrap rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                {etapa}
              </span>
              {i < FLUXO_OPERACIONAL.length - 1 && (
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-2 lg:hidden">
          {FLUXO_OPERACIONAL.map((etapa, i) => (
            <div key={etapa} className="flex flex-col items-start gap-2">
              <span className="whitespace-nowrap rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                {etapa}
              </span>
              {i < FLUXO_OPERACIONAL.length - 1 && (
                <ArrowDown className="ml-3 size-3.5 shrink-0 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
