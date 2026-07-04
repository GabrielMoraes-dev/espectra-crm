import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const atualizacoes = [
    { emailAntigo: "lucas@espectra.com", nome: "Gabriel Moraes", cargo: "Arquiteto", email: "gabriel@espectra.com" },
    { emailAntigo: "rafael@espectra.com", nome: "Ricardo Scherdien", cargo: "Closer", email: "ricardo@espectra.com" },
  ];

  for (const { emailAntigo, nome, cargo, email } of atualizacoes) {
    const existe = await prisma.membroEquipe.findFirst({ where: { email: emailAntigo } });
    if (existe) {
      await prisma.membroEquipe.update({ where: { id: existe.id }, data: { nome, cargo, email } });
      console.log(`Atualizado: ${nome}`);
    } else {
      console.log(`Não encontrado: ${emailAntigo}`);
    }
  }

  console.log("Pronto!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => pool.end());
