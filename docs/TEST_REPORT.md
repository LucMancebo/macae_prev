# API Test Run Report

Data: 2026-05-12

Resumo atual:

- Suites executadas localmente: Múltiplas (M2, M3 e Utils)
- Suites com falha: 0
- Testes totais: 118 (118 passaram) — ambiente local com Docker Postgres (`api/scripts/docker-compose.test.yml`).

Observações importantes:

- A suíte cobre de ponta a ponta: Validadores (38), Cálculos (27), Auth (16), Servidores (5), Consignatárias (8), Produtos (6), Margens (8) e Consignações (10).
- A solução adotada: adição de um runner local (`api/scripts/test_with_local_db.js`) que sobe um Postgres temporário via Docker, executa `prisma db push`, executa a suíte de testes e derruba os containers. Também foi ajustado o registro de plugins nos testes unitários.

Recomendações e próximos passos:

- Para CI/PR: configurar um banco de teste dedicado (Neon sandbox ou uma instância gerenciada) e evitar apontar testes para o DB de produção.
- Garantir que `docs/sensitive/VERCEL_ENV_VARS.secret.md` contenha apenas placeholders (não commitar segredos).
- Automatizar a execução de `npm run --prefix api test:local-db` no fluxo local de desenvolvedor (README / CONTRIBUTING).

Alterações realizadas:

- Adicionados: `api/scripts/test_with_local_db.js`, `api/scripts/docker-compose.test.yml`, `api/scripts/test_with_vercel_db.js` (helper), e `npm run test:local-db` em `api/package.json`.
- Branch criada e mergeada: `feature/add-local-test-db` → `main`.

Status atual: suíte de testes verde em `main` quando executada localmente com Docker Postgres.

Nota de segurança: sempre use arquivos ignorados (`/docs/sensitive/`) para credenciais locais; não promova essas credenciais para o repositório remoto.
