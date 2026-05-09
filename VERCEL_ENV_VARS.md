# 📋 Variáveis Prontas para Vercel Dashboard

## Copy & Paste para Vercel Environment Variables

Acesse: `https://vercel.com/dashboard` → Seu Projeto → Settings → Environment Variables

Adicione cada variável abaixo (copie nome e valor):

---

### **1. DATABASE_URL (Pooler - Para Aplicação)**

```
postgresql://<DB_USER>:<DB_PASSWORD>@<HOST>/<DATABASE>?channel_binding=require&sslmode=require
```

---

### **2. DIRECT_URL (Direct - Para Prisma Migrations)**

```
postgresql://<DB_USER>:<DB_PASSWORD>@<HOST>/<DATABASE>?sslmode=require
```

---

### **3. JWT_SECRET (Gere uma string aleatória)**

```
<SUA_JWT_SECRET_AQUI_MIN_32_CHARS>
```

_Sugestão: Use um gerador online: https://generate-random.org/ (min 32 caracteres)_

---

### **4. CORS_ORIGIN**

```
https://macae-prev.vercel.app
```

---

### **5. NODE_ENV**

```
production
```

---

### **6. NEXT_PUBLIC_API_URL**

```
https://macae-prev.vercel.app/v1
```

---

### **7. AUTH_MAX_TENTATIVAS (opcional)**

```
5
```

Número máximo de tentativas de login antes de bloquear a conta. Default: `5`.

---

### **8. AUTH_BLOQUEIO_MINUTOS (opcional)**

```
30
```

Minutos de bloqueio após exceder `AUTH_MAX_TENTATIVAS`. Default: `30`.

---

### **9. JWT_EXPIRES_IN (opcional)**

```
8h
```

Tempo de expiração do token JWT aceito pela API (padrão `8h`). Pode ser `30m`, `1d`, etc.

---

### **10. DIRECT_URL / POSTGRES_PRISMA_URL (para migrações)**

Se você usa a pipeline de migrations do Prisma separada do pooler, forneça a connection string direta (sem pooler):

```
postgresql://neondb_owner:senha@ep-spring-cake-ac9tv0lz.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

Obs: já incluímos `DIRECT_URL` no topo, mas alguns workflows usam `POSTGRES_PRISMA_URL` ou `POSTGRES_URL_NON_POOLING`. Adicione conforme sua ferramenta de CI.

---

## ⚙️ Como Adicionar no Vercel

1. Abra Vercel Dashboard
2. Selecione projeto `macae-prev`
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Preencha:
   - **Name**: `DATABASE_URL`
   - **Value**: (copie do item #1 acima)
   - **Environment**: `Production`
   - Clique **Add**
6. Repita para cada variável (1-6)

---

## ✅ Checklist

- [ ] DATABASE_URL adicionada ✓
- [ ] DIRECT_URL adicionada ✓
- [ ] JWT_SECRET adicionada ✓
- [ ] CORS_ORIGIN adicionada ✓
- [ ] NODE_ENV = production ✓
- [ ] NEXT_PUBLIC_API_URL adicionada ✓

Depois de adicionar todas, faça um novo deploy ou clique em "Redeploy" no Vercel Dashboard.

---

## 🚀 Próximo Passo

Após configurar variáveis, faça deploy:

1. Vercel Dashboard → **Deployments**
2. Clique em **Deploy** ou **Redeploy**
3. Aguarde build passar ✅

**Tempo estimado:** 2-5 minutos

---

**Data:** 2026-05-09  
**Projeto:** MACAEPREV  
**Status:** ✅ Pronto para deploy no Vercel

---

## 🧰 Uso local — sincronizar com Vercel

Para evitar redundância e inconsistência, use as mesmas chaves do Vercel no desenvolvimento local. Procedimento recomendado:

1. Copie `api/.env.example` → `api/.env` e preencha os valores sensíveis (DATABASE_URL, JWT_SECRET, etc.).
2. Copie `web/.env.local.example` → `web/.env.local` para o frontend (ou use variables de ambiente no terminal).
3. Reinicie os servidores locais:

```bash
# API
cd api
npm install
npm run dev

# Frontend (em outra aba)
cd web
npm install
npm run dev
```

4. Se estiver usando o mesmo banco do Neon em produção, mantenha `DIRECT_URL`/`DATABASE_URL` iguais entre Vercel e local (atenção a permissões de rede).

Se quiser, eu posso automaticamente gerar `api/.env` (com placeholders) usando os valores atuais do `VERCEL_ENV_VARS.md` — quer que eu faça isso agora?
