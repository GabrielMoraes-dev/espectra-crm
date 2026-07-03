import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "hello.espectra@gmail.com";
  const senha = process.env.SEED_SENHA_ESPECTRA;
  if (!senha) throw new Error("Defina SEED_SENHA_ESPECTRA antes de rodar este script");

  const passwordHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.upsert({
    where: { email },
    update: { passwordHash },
    create: { nome: "Espectra", email, passwordHash },
  });

  console.log(`Usuário criado/atualizado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
