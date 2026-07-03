"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export async function login(values: { email: string; password: string }) {
  const data = loginSchema.parse(values);

  const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });
  const valid = usuario ? await bcrypt.compare(data.password, usuario.passwordHash) : false;

  if (!usuario || !valid) {
    throw new Error("Email ou senha inválidos");
  }

  await createSession({ usuarioId: usuario.id, email: usuario.email, nome: usuario.nome });
}

export async function logout() {
  await deleteSession();
}
