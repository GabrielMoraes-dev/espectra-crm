import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await verifySession();
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginForm />
    </div>
  );
}
