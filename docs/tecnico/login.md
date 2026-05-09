**Fluxo de Autenticação (Login)**

Este documento descreve o fluxo de login do MACAEPREV, variáveis de ambiente necessárias, endpoints, comportamento de cookies e passos rápidos de troubleshooting.

Resumo

- **Cookie:** `macae_prev_token` (HttpOnly, SameSite=Lax, `secure` em produção)
- **Token:** JWT assinado com `JWT_SECRET` e expirado conforme `JWT_EXPIRES_IN`
- **Endpoints principais:** `/v1/auth/login`, `/v1/auth/login-mfa`, `/v1/auth/accept-terms`, `/v1/auth/me`, `/v1/auth/logout`

## Endpoints

- `POST /v1/auth/login` — body: `{ "email": "...", "senha": "..." }`.
  - Retorna `200` com `{ token }` e seta o cookie HttpOnly quando login OK.
  - Retorna `{ mfa_requerido: true, usuarioId }` se MFA habilitado.
  - Retorna `{ termos_requeridos: true, usuarioId }` se o usuário precisa aceitar termos (LGPD). Nesse caso um token temporário é retornado e também é setado no cookie.

- `POST /v1/auth/login-mfa` — body: `{ "usuarioId": "...", "code": "123456" }` (verificação MFA).

- `POST /v1/auth/accept-terms` — body: `{ "usuarioId": "...", "termoId": "..." }` (aceita os termos; exige `usuarioId` válido).

- `GET /v1/auth/me` — retorna `{ user }` baseado no cookie de sessão.

- `POST /v1/auth/logout` — limpa o cookie de sessão.

## Variáveis de ambiente importantes

- `DATABASE_URL` / `DIRECT_URL` — connection string do Postgres/Neon. Exemplo (pooler Neon):

  `postgresql://user:senha@host/neondb?channel_binding=require&sslmode=require`

- `JWT_SECRET` — chave secreta para assinar JWT (mínimo recomendado ~32 chars).
- `JWT_EXPIRES_IN` — tempo de expiração do token (ex.: `8h`).
- `CORS_ORIGIN` / `ALLOWED_ORIGINS` — origem do frontend permitida.
- `NEXT_PUBLIC_API_URL` — (frontend) para testes locais, ex.: `http://localhost:3333/v1`.

## Seed e credenciais de teste

- O seed do projeto cria um usuário administrador usado para testes: `admin@macaeprev.rj.gov.br` com senha plana `123456` (armazenada como hash bcrypt).

## Debug / Troubleshooting rápido

- Erro `Credenciais inválidas` — significa que o `email` não foi encontrado no banco ou a senha não confere com o hash bcrypt:
  - Cheque se o email foi digitado exatamente (sem espaços) e se o ambiente está conectando ao DB correto.
  - Verifique `usuario.tentativas_login`, `usuario.bloqueado_ate` e `usuario.status` no banco.

- Erro de conexão (ex.: "Database ... does not exist" ou mensagens do Prisma) — sinal de `DATABASE_URL` malformada:
  - Confirme que a string tem a forma `postgresql://user:pass@host/dbname?params`
  - Evite concatenar variáveis que causem valores inválidos; use `DATABASE_URL` única sempre que possível.
  - Veja `api/.env.example` e `VERCEL_ENV_VARS.md` para os nomes das variáveis esperadas.

## Comandos úteis

- Requisição de login (curl):

```bash
curl -i -X POST 'http://localhost:3333/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@macaeprev.rj.gov.br","senha":"123456"}' \
  -c cookies.txt
```

- Consultar usuário via Prisma (node):

```bash
node -e "require('./api/prisma/prisma').prisma.usuario.findUnique({where:{email:'admin@macaeprev.rj.gov.br'}}).then(u=>console.log(u)).catch(e=>console.error(e)).finally(()=>process.exit())"
```

## Observações operacionais

- O cookie `macae_prev_token` é HttpOnly — o frontend apenas confia no cookie para autenticação de sessão e não armazena o token em `localStorage`.
- Para deploy na Vercel, sincronize as variáveis listadas em `VERCEL_ENV_VARS.md` e confirme `DATABASE_URL` apontando para a base correta.

## Referências

- Configuração de variáveis de ambiente: [VERCEL_ENV_VARS.md](VERCEL_ENV_VARS.md)
- Arquivo de exemplo de env da API: [api/.env.example](api/.env.example)
