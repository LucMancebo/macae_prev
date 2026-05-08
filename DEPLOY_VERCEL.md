# 🚀 Guia de Deploy MacaePrev na Vercel

Este documento descreve como realizar o deploy do sistema na Vercel utilizando a estrutura de monorepo atual (Pasta `api` e Pasta `web`).

---

## 1. Pré-requisitos
*   Um banco de dados PostgreSQL externo (Vercel Postgres, Neon.tech ou Supabase).
*   Conta na [Vercel](https://vercel.com).
*   Projeto hospedado no GitHub/GitLab.

---

## 2. Deploy do Backend (Pasta `/api`)

Como nossa API usa Fastify, configuramos o arquivo `api/vercel.json` para transformá-la em Serverless Functions.

### Passos na Vercel:
1.  Clique em **Add New > Project**.
2.  Selecione seu repositório.
3.  Em **Root Directory**, selecione a pasta `api`.
4.  Em **Framework Preset**, selecione `Other`.
5.  Em **Environment Variables**, adicione:
    *   `DATABASE_URL`: A URL do seu banco de dados externo.
    *   `JWT_SECRET`: Uma chave segura e longa.
    *   `NODE_ENV`: `production`

---

## 3. Deploy do Frontend (Pasta `/web`)

O frontend é um projeto Next.js padrão.

### Passos na Vercel:
1.  Clique em **Add New > Project**.
2.  Selecione o mesmo repositório.
3.  Em **Root Directory**, selecione a pasta `web`.
4.  Em **Framework Preset**, selecione `Next.js`.
5.  Em **Environment Variables**, adicione:
    *   `NEXT_PUBLIC_API_URL`: A URL gerada pelo deploy da API (ex: `https://macaeprev-api.vercel.app`).
    *   `NODE_ENV`: `production`

---

## 4. Banco de Dados e Migrations

A Vercel não roda o banco de dados (Docker). Você deve apontar para um banco externo.

### Rodando Migrations:
Sempre que alterar o banco, rode localmente apontando para o banco de produção (CUIDADO):
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
*   **SSL**: A Vercel fornece SSL (HTTPS) automaticamente, atendendo ao requisito de segurança.
*   **Logs**: Você pode visualizar os logs em tempo real na aba **Logs** do projeto na Vercel para auditoria técnica.
