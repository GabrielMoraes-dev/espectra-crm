import { ClipboardList, FileSignature, FileCheck2, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FadeIn } from "@/components/shared/fade-in";
import { ModeloCard } from "@/components/modelos/modelo-card";
import { DEMO_ID } from "@/lib/constants";

export default function ModelosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Modelos"
        description="Acesso rápido às páginas públicas que a Espectra usa no dia a dia — pra ver como o cliente enxerga, sem precisar abrir um lead ou cliente de verdade. Preencher e enviar aqui não salva nada."
      />

      <FadeIn>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ModeloCard
            icon={ClipboardList}
            titulo="Briefing inicial"
            descricao="O link curto que convence o lead a ver a amostra gratuita: nome, profissão, apresentação e fotos."
            href={`/formulario/inicial/${DEMO_ID}`}
          />
          <ModeloCard
            icon={FileCheck2}
            titulo="Briefing completo"
            descricao="O formulário completo enviado depois que o cliente topa seguir em frente, com todas as seções."
            href={`/formulario/lead/${DEMO_ID}`}
          />
          <ModeloCard
            icon={Star}
            titulo="Pesquisa de avaliação"
            descricao="A pesquisa de satisfação enviada quando o projeto é finalizado."
            href={`/pesquisa/${DEMO_ID}`}
          />
          <ModeloCard
            icon={FileSignature}
            titulo="Contrato de prestação de serviços"
            descricao="O modelo do contrato enviado pra assinatura eletrônica, em PDF."
            href="/api/contrato-modelo"
          />
        </div>
      </FadeIn>
    </div>
  );
}
