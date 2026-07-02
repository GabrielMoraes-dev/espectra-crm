import Image from "next/image";
import { Sparkles } from "lucide-react";

export function BriefingSuccess() {
  return (
    <div className="py-24 text-center">
      <div className="relative mx-auto mb-8 h-9 w-36">
        <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain" />
      </div>
      <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
        <Sparkles className="size-5" />
      </div>
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        Recebemos seu briefing.
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Obrigado por confiar à Espectra a forma como o mercado vai te enxergar. Em breve
        entraremos em contato com os próximos passos.
      </p>
    </div>
  );
}
