-- CreateEnum
CREATE TYPE "TipoInteracaoLead" AS ENUM ('WHATSAPP', 'LIGACAO', 'REUNIAO', 'AMOSTRA_ENVIADA', 'PROPOSTA_ENVIADA', 'OUTRO');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "etapaAlteradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ultimaInteracaoEm" TIMESTAMP(3),
ADD COLUMN     "ultimaInteracaoTipo" "TipoInteracaoLead";

-- Backfill: linhas existentes recebem CURRENT_TIMESTAMP da linha acima por padrão,
-- o que não reflete quando a etapa realmente mudou. Usa a data do último ActivityLog
-- de mudança de etapa daquele lead como melhor aproximação real disponível; na
-- ausência de log (leads muito antigos ou nunca movidos), cai para updatedAt —
-- nunca inventa uma data mais recente que a última edição conhecida do registro.
-- ultimaInteracaoEm/ultimaInteracaoTipo ficam NULL para leads antigos: não há
-- registro de interação real anterior a essa migration, então "sem dado" é o
-- valor correto, não uma aproximação.
UPDATE "Lead" AS l
SET "etapaAlteradaEm" = COALESCE(
  (
    SELECT MAX(a."createdAt")
    FROM "ActivityLog" a
    WHERE a."entidadeTipo" = 'lead'
      AND a."entidadeId" = l.id
      AND a."tipo" IN ('lead_etapa', 'lead_perdido')
  ),
  l."updatedAt"
);
