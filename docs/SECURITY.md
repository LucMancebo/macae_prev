**Segurança & Gestão de Segredos**

Este arquivo descreve regras operacionais para evitar vazamento de segredos no repositório.

Regras rápidas

- Nunca commitar arquivos `.env` ou arquivos que contenham chaves/credentials.
- Use o Vercel Dashboard ou outro secret manager para armazenar `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` e outros segredos.
- Adicione exemplos não sensíveis em `*.example` (por exemplo `api/.env.example`) e comente explicitamente que são placeholders.

.gitignore verify

- O repositório já ignora os arquivos de ambiente comuns (`.env`, `.env.local`, etc.). Confirme que esses padrões existem em `/.gitignore` e em `api/.gitignore` e `web/.gitignore`.

Remediação em caso de vazamento

- Se um segredo for acidentalmente commitado: rotacione o segredo no provedor (DB, JWT, etc.) imediatamente.
- Considere limpar o histórico Git (ex.: `git filter-repo`) se for necessário remover os valores antigos dos commits — atenção: operação disruptiva para colaboradores.

Boas práticas

- Use variáveis de ambiente na Vercel e não armazene segredos em arquivos de configuração.
- Para CI, use secret stores nativos (Vercel, GitHub Actions Secrets, etc.).
- Documente onde cada segredo deve ser configurado (ver `VERCEL_ENV_VARS.md` e `api/.env.example`).
