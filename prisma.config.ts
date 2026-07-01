import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    async adapter(env) {
      const pg = await import("pg");
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
      return new PrismaPg(pool);
    },
  },
});
