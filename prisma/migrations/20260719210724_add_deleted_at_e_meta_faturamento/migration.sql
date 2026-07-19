-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ConfiguracaoEmpresa" ADD COLUMN     "metaFaturamentoMensal" DOUBLE PRECISION;
