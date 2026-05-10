# API Test Run Report

Data: 2026-05-10

Resumo:

- Suites executadas: 5
- Suites com falha: 5
- Testes: 16 (5 passaram, 11 falharam)

Principais erros observados:

1. `AuthController` unit test

- Esperado: 200 com token
- Recebido: 401
- Observações: Apesar do `AuthService` ter sido mockado, a rota retornou 401 — suspeita de problema com plugins do Fastify (ex.: `reply.setCookie` ausente) ou validação de payload.

2. E2E tests (Auth LGPD, MFA, Servidores)

- Erro recorrente: `prisma:error undefined` seguido de `TypeError` em pontos onde o Prisma é utilizado.
- Observações: Os testes E2E estão tentando acessar o Prisma real sem uma `DATABASE_URL` de teste adequada ou sem mocks.

3. Validações Fastify

- Mensagens de validação: `body must have required property 'email'` / `'senha'` em alguns requests — indica payloads enviados incorretamente ou ausência de content-type na injeção das requests.

Recomendações imediatas:

- Registrar `@fastify/cookie` nos testes unitários que usam `reply.setCookie` ou mockar `reply.setCookie` — isso corrige falhas unitárias rápidas.
- Para E2E: escolher entre fornecer um banco de teste (ex.: SQLite ou Neon sandbox) ou mockar o `prisma` nas suítes E2E para desacoplar da infra.
- Revisar fixtures de testes para garantir `Content-Type: application/json` ao usar `app.inject`.

Próximas ações realizadas neste commit:

- Adicionar `docs/TEST_REPORT.md` (este arquivo).
- Aplicar correção rápida nos testes unitários (registro de plugin cookie) e re-executar testes.
