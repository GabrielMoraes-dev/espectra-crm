import Image from "next/image";

export function BriefingInicialSuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mx-auto mb-8 h-10 w-40">
        <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain" />
      </div>
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        Recebemos suas informações!
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Já vamos preparar sua amostra gratuita. Em breve entraremos em contato.
      </p>
    </div>
  );
}
