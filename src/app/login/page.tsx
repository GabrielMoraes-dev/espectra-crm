import Image from "next/image";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";
import { WaveBackground } from "@/components/auth/wave-background";

export default async function LoginPage() {
  const session = await verifySession();
  if (session) redirect("/");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-900 px-4 py-10">
      <WaveBackground />

      <div className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.65)] ring-1 ring-white/15 md:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-brand-900 px-10 py-16 text-center">
          <div className="relative h-10 w-40">
            <Image src="/logo-espectra.png" alt="Espectra" fill className="object-contain" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[.22em] text-brand-300 uppercase">
              CRM Espectra
            </p>
            <h1 className="font-heading mt-4 text-3xl leading-tight font-bold text-white">
              Toda a operação,
              <br />
              <span className="text-brand-300">num só lugar.</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-white px-4 py-16">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
