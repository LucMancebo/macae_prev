## Manual do Desenvolvedor

Este documento descreve o setup local e práticas recomendadas para contribuir no projeto.

Ambiente recomendado

- Node.js LTS (recomendado: Node 24.x LTS). Mantenha o runtime do CI e produção alinhados com Node 24.x.
- npm >= 9 ou yarn v1/v3 conforme preferência.
- TypeScript (recomendado): 6.x — alinhar com `api/package.json` (usa TypeScript 6.x). Se optar por usar TS 5.x no `web`, atualize `web/package.json` e testes antes de publicar.

Setup local (API)

1. Copie exemplos de variáveis: `cp api/.env.example api/.env` e preencha com valores de desenvolvimento (Neon / Vercel credenciais de dev).
2. Instale dependências: `npm install` (na raiz ou `npm install --prefix api`).
3. Rodar em dev: `npm run --prefix api dev` (usa `tsx watch src/server.ts`).
4. Rodar testes: `npm run --prefix api test`.

Setup local (Web)

1. `npm install --prefix web`
2. `npm run --prefix web dev`

Gerar OpenAPI localmente

1. Build da API: `npm run --prefix api build`.
2. Gerar spec: `npm run --prefix api generate:openapi` (escreve em `docs/integracao/openapi.json`).

Recomendações de versão e atualização

- Para manter compatibilidade, centralize a versão do TypeScript e Node LTS nas documentações e no CI.
- Antes de atualizar dependências para uma nova LTS, rode a suíte de testes e verifique breaking changes nos `CHANGELOG` dos pacotes críticos (`next`, `react`, `prisma`, `@prisma/client`).

Boas práticas de contribuição

- Crie branch por tarefa: `feature/<descrição>`.
- Inclua testes para alterações de regras de negócio.
- Atualize `docs/integracao/openapi.json` após alterações em rotas e publique via CI.
