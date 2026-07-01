import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { MembroEquipe } from "@/generated/prisma/client";

export function ContaCard({ membros }: { membros: MembroEquipe[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Conta e acesso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Esta versão é de uso interno e não exige login individual. A equipe com acesso é:
        </p>
        <ul className="space-y-2.5">
          {membros.map((membro) => (
            <li key={membro.id} className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {initials(membro.nome)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{membro.nome}</p>
                <p className="text-xs text-muted-foreground">{membro.cargo}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/equipe" className="inline-block text-xs font-medium text-brand-100 hover:underline">
          Gerenciar equipe →
        </Link>
      </CardContent>
    </Card>
  );
}
