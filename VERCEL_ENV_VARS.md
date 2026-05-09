# 📋 Variáveis Prontas para Vercel Dashboard

## Copy & Paste para Vercel Environment Variables

Acesse: `https://vercel.com/dashboard` → Seu Projeto → Settings → Environment Variables

Adicione cada variável abaixo (copie nome e valor):

---

### **1. DATABASE_URL (Pooler - Para Aplicação)**

```
postgresql://neondb_owner:npg_Kczd8Z0DbEkr@ep-spring-cake-ac9tv0lz-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

---

### **2. DIRECT_URL (Direct - Para Prisma Migrations)**

```
postgresql://neondb_owner:npg_Kczd8Z0DbEkr@ep-spring-cake-ac9tv0lz.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

---

### **3. JWT_SECRET (Gere uma string aleatória)**

```
sua-chave-secreta-jwt-super-segura-aqui-min-32-chars
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
