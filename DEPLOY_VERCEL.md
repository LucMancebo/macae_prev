# 🚀 Guia de Deploy MacaePrev na Vercel

Este documento descreve o passo a passo detalhado para realizar o deploy do sistema MACAEPREV na Vercel, utilizando a estrutura de monorepo (pastas `api` e `web`) e o banco de dados PostgreSQL no Neon.tech.

---

## 1. Pré-requisitos

- Um banco de dados PostgreSQL externo (Vercel Postgres, Neon.tech ou Supabase).
- Conta na [Vercel](https://vercel.com).
- Projeto hospedado no GitHub/GitLab (com o arquivo `vercel.json` na raiz).

---

## 2. Configuração do Banco de Dados (Neon.tech)

1.  Acesse Neon.tech e crie uma conta ou faça login.
2.  Crie um novo projeto e um banco de dados PostgreSQL.
3.  Copie a **Connection String** fornecida pelo Neon.tech. Ela será utilizada nas variáveis de ambiente da Vercel.
    - Sua Connection String: `postgresql://neondb_owner:npg_E3Hx2aSkvPfz@ep-little-dawn-ac2hryjr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

---

## 3. Preparação do Projeto Local

### 3.1. `vercel.json` (Arquivo de Configuração do Monorepo)

Certifique-se de que o arquivo `vercel.json` esteja na **raiz do seu projeto**. Este arquivo informa à Vercel como construir e rotear suas aplicações (Frontend e Backend) dentro do monorepo. O conteúdo deve ser similar ao seguinte:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/api/index.ts",
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
      "dest": "api/src/server.ts",
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
3.  Quando solicitado, a Vercel deve detectar automaticamente a configuração de monorepo devido ao `vercel.json`.
    - **Root Directory:** Deixe em branco ou confirme que está apontando para a raiz do seu repositório.
    - **Framework Preset:** A Vercel deve identificar `Next.js` para o frontend e `@vercel/node` para o backend automaticamente.
4.  Em **Environment Variables**, adicione as seguintes variáveis de ambiente (para o projeto Vercel como um todo):
    - `DATABASE_URL`: Cole a Connection String do Neon.tech que você copiou no Passo 2.
    - `JWT_SECRET`: Uma chave secreta forte e longa para a autenticação JWT da sua API.
    - `CORS_ORIGIN`: A URL de produção do seu projeto na Vercel (ex: `https://seu-projeto.vercel.app`). Você pode deixar `*` temporariamente para testes, mas **NÃO** em produção.
    - `NODE_ENV`: `production`
    - `NEXT_PUBLIC_API_URL`: A URL da sua API na Vercel (ex: `https://seu-projeto.vercel.app/v1`). A Vercel irá gerar essa URL após o primeiro deploy. Você pode precisar atualizar essa variável após o deploy inicial.
5.  Clique em **Deploy**. A Vercel fará o build e o deploy do seu frontend e backend.

---

## 5. Gerenciamento de Banco de Dados e Migrations

A Vercel não hospeda bancos de dados PostgreSQL diretamente. Você deve apontar para um serviço externo como o Neon.tech.

### Rodando Migrations:

Sempre que houver alterações no esquema do banco de dados (via Prisma), você precisará rodar as migrations. **CUIDADO:** Execute este comando localmente, apontando para o seu banco de dados de produção no Neon.tech.

```bash
# No diretório /api
DATABASE_URL="sua_url_de_produção" npx prisma db push
```

---

## 5. CI/CD (Automatização)

Uma vez configurado, cada `git push` para a branch `main` irá:

1.  Gerar um novo build do Backend.
2.  Gerar um novo build do Frontend.
3.  Atualizar o sistema automaticamente em produção.

---

## 💡 Dicas de Produção (Compliance POC)

- **SSL**: A Vercel fornece SSL (HTTPS) automaticamente, atendendo ao requisito de segurança.
- **Logs**: Você pode visualizar os logs em tempo real na aba **Logs** do projeto na Vercel para auditoria técnica.
