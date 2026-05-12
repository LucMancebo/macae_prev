# Variáveis de Ambiente — Vercel (ambiente de desenvolvimento)

Estas variáveis são usadas quando o projeto está sendo executado temporariamente no Vercel/Neon durante desenvolvimento. Em produção, armazene secrets no AWS Secrets Manager.

- `DATABASE_URL` — URL de conexão com Postgres (Neon/Vercel). Ex: `postgresql://user:pass@host:5432/db`.
- `DIRECT_URL` — Conexão direta when applicable (Neon specific).
- `JWT_SECRET` — Chave secreta para geração/verificação de tokens JWT.
- `NODE_ENV` — `development` / `production`.
- `SENTRY_DSN` — (opcional) DSN do Sentry para erros.
- `VERCEL_URL` — variável provida pelo Vercel (não commitável).

Regras

- Nunca commitar valores reais. Utilize `api/.env.example` como referência.
- Ao migrar para AWS, documente as variáveis correspondentes no `docs/manual_deploy.md` e mova os valores para o Secrets Manager.
