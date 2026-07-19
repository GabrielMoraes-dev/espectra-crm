"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, verifySession, requireAuth } from "@/lib/auth/session";
import { sendContaBloqueadaAlerta } from "@/lib/email";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;

// Hash "de mentira" pra rodar o bcrypt.compare mesmo quando o email não existe —
// sem isso, um email inexistente respondia bem mais rápido que um email real com
// senha errada, dando pra descobrir por timing quais emails têm conta.
const DUMMY_HASH = bcrypt.hashSync("nao-existe-conta-com-esse-email", 10);

// Camada extra de proteção por IP — o bloqueio por conta sozinho não impede um
// ataque vindo de vários IPs diferentes contra a mesma conta compartilhada.
const MAX_TENTATIVAS_IP = 20;
const JANELA_IP_MS = 15 * 60 * 1000;

async function getIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "desconhecido";
}

export async function login(values: { email: string; password: string }) {
  const data = loginSchema.parse(values);
  const ip = await getIp();

  const desde = new Date(Date.now() - JANELA_IP_MS);
  const tentativasIp = await prisma.tentativaLoginIp.count({ where: { ip, createdAt: { gte: desde } } });
  if (tentativasIp >= MAX_TENTATIVAS_IP) {
    throw new Error("Muitas tentativas de login vindas do seu endereço. Tente novamente mais tarde.");
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });

  if (usuario?.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    const minutos = Math.ceil((usuario.bloqueadoAte.getTime() - Date.now()) / 60000);
    throw new Error(`Muitas tentativas erradas. Tente novamente em ${minutos} minuto${minutos !== 1 ? "s" : ""}.`);
  }

  const compareResult = await bcrypt.compare(data.password, usuario?.passwordHash ?? DUMMY_HASH);
  const valid = usuario ? compareResult : false;

  if (!usuario || !valid) {
    await prisma.tentativaLoginIp.create({ data: { ip } });
    if (usuario) {
      // Incremento atômico no banco — evita que tentativas concorrentes (várias
      // requisições erradas ao mesmo tempo) percam contagem por causa de um
      // read-then-write não atômico, o que poderia atrasar ou nunca disparar o bloqueio.
      const atualizado = await prisma.usuario.update({
        where: { id: usuario.id },
        data: { tentativasFalhas: { increment: 1 } },
      });
      if (atualizado.tentativasFalhas >= MAX_TENTATIVAS) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { tentativasFalhas: 0, bloqueadoAte: new Date(Date.now() + BLOQUEIO_MS) },
        });
        // Avisa por e-mail — pode ser vocês mesmos errando a senha, mas também pode
        // ser alguém tentando adivinhar; melhor saber na hora.
        await sendContaBloqueadaAlerta(usuario.email, Math.round(BLOQUEIO_MS / 60000));
      }
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

const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual"),
  novaSenha: z.string().min(8, "A nova senha precisa ter pelo menos 8 caracteres"),
});

export async function alterarSenha(values: { senhaAtual: string; novaSenha: string }) {
  const session = await requireAuth();
  const data = alterarSenhaSchema.parse(values);

  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: session.usuarioId } });
  const senhaCorreta = await bcrypt.compare(data.senhaAtual, usuario.passwordHash);
  if (!senhaCorreta) {
    throw new Error("Senha atual incorreta");
  }

  const passwordHash = await bcrypt.hash(data.novaSenha, 10);
  await prisma.usuario.update({ where: { id: usuario.id }, data: { passwordHash } });
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
