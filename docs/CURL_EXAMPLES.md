# Exemplos de uso da API MACAEPREV (curl)

Este documento fornece exemplos rápidos de como interagir com a API usando `curl`.

## 1. Health Check
Verifica se o servidor está online.

```bash
curl -X GET http://localhost:3333/health
```

**Resposta esperada (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2026-05-07T18:00:00.000Z"
}
```

---

## 2. Autenticação (Login)
Realiza o login para obter o token JWT.

```bash
curl -X POST http://localhost:3333/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
           "email": "admin@macaeprev.rj.gov.br",
           "senha": "123456"
         }'
```

**Resposta esperada (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuarioId": "uuid-do-usuario"
}
```

**Erro (401 Unauthorized - Senha Errada):**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Credenciais inválidas",
    "statusCode": 401,
    "timestamp": "2026-05-07T18:00:00.000Z"
  }
}
```

---

## 3. Obter Usuário Atual (/me)
Retorna dados do usuário autenticado. Substitua `SEU_TOKEN_AQUI` pelo token obtido no login.

```bash
curl -X GET http://localhost:3333/v1/auth/me \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@macaeprev.rj.gov.br",
    "nome": "Administrador Master",
    "perfil": "ADMINISTRADOR",
    "consignataria_id": null
  }
}
```

---

## 4. Teste de Rate-limiting (Bloqueio)
Tente fazer login com a senha errada 5 vezes seguidas.

**Resposta na 6ª tentativa (401 Unauthorized):**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Usuário bloqueado por excesso de tentativas. Tente novamente em 30 minuto(s).",
    "statusCode": 401,
    "timestamp": "2026-05-07T18:00:00.000Z"
  }
}
```
