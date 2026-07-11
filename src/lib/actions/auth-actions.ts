"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, verifySession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;

export async function login(values: { email: string; password: string }) {
  const data = loginSchema.parse(values);

  const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });

  if (usuario?.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    const minutos = Math.ceil((usuario.bloqueadoAte.getTime() - Date.now()) / 60000);
    throw new Error(`Muitas tentativas erradas. Tente novamente em ${minutos} minuto${minutos !== 1 ? "s" : ""}.`);
  }

  const valid = usuario ? await bcrypt.compare(data.password, usuario.passwordHash) : false;

  if (!usuario || !valid) {
    if (usuario) {
      const tentativas = usuario.tentativasFalhas + 1;
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          tentativasFalhas: tentativas >= MAX_TENTATIVAS ? 0 : tentativas,
          bloqueadoAte: tentativas >= MAX_TENTATIVAS ? new Date(Date.now() + BLOQUEIO_MS) : null,
        },
      });
    }
    throw new Error("Email ou senha inválidos");
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { tentativasFalhas: 0, bloqueadoAte: null },
  });

  await createSession({ usuarioId: usuario.id, email: usuario.email, nome: usuario.nome });

  await prisma.activityLog.create({
    data: {
      tipo: "login",
      descricao: `${usuario.nome} entrou no CRM`,
      entidadeTipo: "usuario",
      entidadeId: usuario.id,
    },
  });
}

export async function logout() {
  const session = await verifySession();
  await deleteSession();

  if (session) {
    await prisma.activityLog.create({
      data: {
        tipo: "logout",
        descricao: `${session.nome} saiu do CRM`,
        entidadeTipo: "usuario",
        entidadeId: session.usuarioId,
      },
    });
  }
}
