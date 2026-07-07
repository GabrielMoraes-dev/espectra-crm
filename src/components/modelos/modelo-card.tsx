import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ModeloCard({
  icon: Icon,
  titulo,
  descricao,
  href,
}: {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  href: string;
}) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Card className="group h-full transition-colors hover:border-brand-300/50">
        <CardContent className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-brand-100">
            <Icon className="size-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-foreground">{titulo}</h3>
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
