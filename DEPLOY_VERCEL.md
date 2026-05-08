# 🚀 Guia de Deploy MacaePrev na Vercel

Este documento descreve o passo a passo para publicar o monorepo MACAEPREV na Vercel, com frontend Next.js e API Fastify no mesmo projeto e banco PostgreSQL no Neon.tech.

---

## 1. Pré-requisitos

- Um banco de dados PostgreSQL externo (Vercel Postgres, Neon.tech ou Supabase).
- Conta na [Vercel](https://vercel.com).
- Projeto hospedado no GitHub/GitLab com o arquivo `vercel.json` na raiz do repositório.

---

## 2. Configuração do Banco de Dados (Neon.tech)

1.  Acesse Neon.tech e crie uma conta ou faça login.
2.  Crie um novo projeto e um banco de dados PostgreSQL.
3.  Copie a **Connection String** fornecida pelo Neon.tech. Ela será utilizada nas variáveis de ambiente da Vercel.
    - Sua Connection String: `postgresql://neondb_owner:npg_E3Hx2aSkvPfz@ep-little-dawn-ac2hryjr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

---

## 3. Preparação do Projeto Local

### 3.1. `vercel.json` (Configuração do Monorepo)

Certifique-se de que o arquivo `vercel.json` esteja na raiz do projeto. Ele deve instruir a Vercel a compilar o frontend em `web/` e a API em `api/`.

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/v1/(.*)",
      "dest": "api/index.ts",
      "continue": true
    },
    {
      "src": "/(.*)",
      "dest": "web/$1"
    }
  ]
}
```

### 3.2. `api/package.json` (Script `postinstall` para Prisma)

Para que o Prisma Client seja gerado corretamente durante o build na Vercel, adicione o script `postinstall` ao `package.json` da sua API:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## 4. Configuração e Deploy na Vercel

1.  Acesse o Vercel Dashboard e clique em **Add New > Project**.
2.  Selecione seu repositório Git (GitHub/GitLab).
3.  Em **Environment Variables** do projeto, adicione:

- `DATABASE_URL`: string de conexão principal do Neon, preferencialmente a pooler URL.
- `DIRECT_URL`: string de conexão direta do Neon para migrações e comandos administrativos do Prisma.
- `JWT_SECRET`: chave forte para JWT.
- `CORS_ORIGIN`: URL autorizada do frontend em produção. Se precisar de múltiplas origens, separe por vírgula. O backend também aceita `ALLOWED_ORIGINS` por compatibilidade.
- `NODE_ENV`: `production`
- `NEXT_PUBLIC_API_URL`: URL pública do projeto na Vercel, apontando para a raiz da aplicação. Em produção, o frontend consumirá a API em `${NEXT_PUBLIC_API_URL}/v1`.

4.  Clique em **Deploy**.

---

## 5. Gerenciamento de Banco de Dados e Migrations

A Vercel não hospeda bancos de dados PostgreSQL diretamente. Você deve apontar para um serviço externo como o Neon.tech.

### Rodando Migrations:

Sempre que houver alterações no esquema do banco de dados (via Prisma), você precisará rodar as migrations. **CUIDADO:** Execute este comando localmente, apontando para o seu banco de dados de produção no Neon.tech.

```bash
# No diretório /api
DATABASE_URL="sua_url_de_producao" npx prisma db push
```

---

## 6. CI/CD (Automatização)

Uma vez configurado, cada `git push` para a branch `main` irá:

1.  Gerar um novo build do Backend.
2.  Gerar um novo build do Frontend.
3.  Atualizar o sistema automaticamente em produção.

---

## 💡 Dicas de Produção (Compliance POC)

- **SSL**: A Vercel fornece SSL (HTTPS) automaticamente, atendendo ao requisito de segurança.
- **Logs**: Você pode visualizar os logs em tempo real na aba **Logs** do projeto na Vercel para auditoria técnica.
