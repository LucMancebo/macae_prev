const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL ausente no ambiente');
  }

  const sql = neon(databaseUrl);

  let perfilRows = await sql`SELECT id FROM perfis_acesso WHERE nome = 'ADMINISTRADOR' LIMIT 1`;
  let perfilId = perfilRows[0]?.id;

  if (!perfilId) {
    perfilId = randomUUID();
    await sql`
      INSERT INTO perfis_acesso (id, nome, descricao, permissoes, created_at, updated_at)
      VALUES (${perfilId}::uuid, 'ADMINISTRADOR', 'Acesso total ao sistema MACAEPREV', ${JSON.stringify(['*'])}::jsonb, NOW(), NOW())
    `;
  }

  const senhaHash = await bcrypt.hash('123456', 10);
  const userId = randomUUID();

  await sql`
    INSERT INTO usuarios (
      id, nome, email, senha_hash, perfil_id, status, mfa_habilitado,
      aceitou_termos, tentativas_login, created_at, updated_at
    )
    VALUES (
      ${userId}::uuid,
      'Administrador Master',
      'admin@macaeprev.rj.gov.br',
      ${senhaHash},
      ${perfilId}::uuid,
      'ATIVO',
      false,
      true,
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      senha_hash = EXCLUDED.senha_hash,
      status = 'ATIVO',
      perfil_id = EXCLUDED.perfil_id,
      aceitou_termos = true,
      tentativas_login = 0,
      bloqueado_ate = NULL,
      updated_at = NOW()
  `;

  const termoRows = await sql`SELECT id FROM termos_uso WHERE publicado = true LIMIT 1`;
  if (!termoRows[0]) {
    await sql`
      INSERT INTO termos_uso (id, versao, conteudo, publicado, created_at)
      VALUES (${randomUUID()}::uuid, '1.0', 'Termo inicial de uso do MACAEPREV.', true, NOW())
    `;
  }

  console.log('OK: admin provisionado no Neon.');
  console.log('Email: admin@macaeprev.rj.gov.br');
  console.log('Senha: 123456');
}

main().catch((err) => {
  console.error('ERRO ao provisionar admin:', err.message || err);
  process.exit(1);
});
