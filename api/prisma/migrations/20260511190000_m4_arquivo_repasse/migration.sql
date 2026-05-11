-- M4: Arquivo, Repasse e campos de reconciliação em Parcela

ALTER TABLE "parcelas"
    ADD COLUMN IF NOT EXISTS "data_processamento_folha" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "status_reconciliacao" TEXT;

CREATE TABLE IF NOT EXISTS "arquivos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(200) NOT NULL,
    "tipo" TEXT NOT NULL,
    "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_processamento" TIMESTAMP(3),
    "usuario_id" UUID NOT NULL,
    "consignante_id" VARCHAR(50),
    "checksum_md5" VARCHAR(32),
    "checksum_sha256" VARCHAR(64),
    "tamanho_bytes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "linhas_total" INTEGER NOT NULL,
    "linhas_processadas" INTEGER NOT NULL,
    "linhas_erro" INTEGER NOT NULL,
    "encoding_detectado" VARCHAR(20) NOT NULL,
    "delimiter_detectado" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "repasses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parcela_id" UUID NOT NULL,
    "arquivo_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "percentual" DECIMAL(7,4),
    "data_movimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repasses_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    ALTER TABLE "arquivos"
        ADD CONSTRAINT "arquivos_usuario_id_fkey"
        FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "repasses"
        ADD CONSTRAINT "repasses_parcela_id_fkey"
        FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "repasses"
        ADD CONSTRAINT "repasses_arquivo_id_fkey"
        FOREIGN KEY ("arquivo_id") REFERENCES "arquivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
