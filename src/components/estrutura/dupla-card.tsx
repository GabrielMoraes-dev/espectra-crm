import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CARGO_INDICATOR } from "@/lib/constants";
import { initials, parseResponsabilidades } from "@/lib/utils";
import type { MembroEquipe } from "@/generated/prisma/client";

export function DuplaCard({ membro }: { membro: MembroEquipe }) {
  const responsabilidades = parseResponsabilidades(membro.responsabilidades);
  const indicador = CARGO_INDICATOR[membro.cargo];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-brand-500/10 blur-2xl" />
      <CardContent className="relative space-y-5">
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="size-12">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {initials(membro.nome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{membro.nome}</p>
            <h3 className="text-lg font-semibold text-foreground">{membro.cargo}</h3>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Responsável por</p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {responsabilidades.map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-foreground">
                <span className="size-1 shrink-0 rounded-full bg-brand-300" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {indicador && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-100">
            <Sparkles className="size-3.5" />
            {indicador}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
