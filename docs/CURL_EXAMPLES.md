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

## 4. Consignações — Criar Nova Consignação

Cria uma nova solicitação de consignação (status SOLICITADA).

```bash
curl -X POST http://localhost:3333/v1/consignacoes \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
           "servidor_id": "uuid-servidor",
           "consignataria_id": "uuid-consignataria",
           "produto_id": "uuid-produto",
           "valor_solicitado": 5000.00,
           "taxa_juros": 1.5,
           "quantidade_parcelas": 12
         }'
```

**Resposta esperada (201 Created):**

```json
{
  "id": "uuid-consignacao",
  "servidor_id": "uuid-servidor",
  "consignataria_id": "uuid-consignataria",
  "produto_id": "uuid-produto",
  "valor_total": 5965.25,
  "taxa_juros": 1.5,
  "cet_percentual": 19.56,
  "quantidade_parcelas": 12,
  "valor_parcela": 497.11,
  "status_fluxo": "SOLICITADA",
  "data_criacao": "2026-05-07T18:00:00.000Z"
}
```

---

## 5. Consignações — Listar Todas

```bash
curl -X GET "http://localhost:3333/v1/consignacoes?page=1&limit=10" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "servidor_id": "uuid-servidor",
      "consignataria_id": "uuid-consignataria",
      "status_fluxo": "SOLICITADA",
      "valor_total": 5965.25,
      "data_criacao": "2026-05-07T18:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

---

## 6. Consignações — Buscar Uma Consignação

```bash
curl -X GET http://localhost:3333/v1/consignacoes/uuid-consignacao \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200 OK):**

```json
{
  "id": "uuid-consignacao",
  "servidor": {
    "id": "uuid-servidor",
    "nome": "João Silva",
    "cpf": "***.***.***-**",
    "matricula": "123456"
  },
  "consignataria": {
    "id": "uuid-consignataria",
    "nome": "Banco XYZ",
    "cnpj": "**.***.***/****-**"
  },
  "produto": {
    "id": "uuid-produto",
    "nome": "Empréstimo Consignado",
    "tipo": "EMPRESTIMO"
  },
  "valor_total": 5965.25,
  "taxa_juros": 1.5,
  "cet_percentual": 19.56,
  "quantidade_parcelas": 12,
  "valor_parcela": 497.11,
  "status_fluxo": "SOLICITADA",
  "data_criacao": "2026-05-07T18:00:00.000Z"
}
```

---

## 7. Consignações — Listar Parcelas

```bash
curl -X GET http://localhost:3333/v1/consignacoes/uuid-consignacao/parcelas \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-parcela-1",
      "numero_parcela": 1,
      "valor": 497.11,
      "competencia": "2026-06",
      "status": "PREVISTA"
    },
    {
      "id": "uuid-parcela-2",
      "numero_parcela": 2,
      "valor": 497.11,
      "competencia": "2026-07",
      "status": "PREVISTA"
    }
  ],
  "total": 12
}
```

---

## 8. Consignações — Aprovar (Admin Only)

Muda status de SOLICITADA para APROVADA.

```bash
curl -X PUT http://localhost:3333/v1/consignacoes/uuid-consignacao/aprovar \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
     -d '{
           "aprovado_por": "uuid-admin"
         }'
```

**Resposta esperada (200 OK):**

```json
{
  "id": "uuid-consignacao",
  "status_fluxo": "APROVADA",
  "data_aprovacao": "2026-05-07T19:00:00.000Z",
  "aprovado_por": "uuid-admin"
}
```

---

## 9. Consignações — Ativar e Gerar Parcelas

Muda status de APROVADA para ATIVA e cria as parcelas.

```bash
curl -X PUT http://localhost:3333/v1/consignacoes/uuid-consignacao/ativar \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{}'
```

**Resposta esperada (200 OK):**

```json
{
  "id": "uuid-consignacao",
  "status_fluxo": "ATIVA",
  "data_ativacao": "2026-05-07T20:00:00.000Z",
  "parcelas_geradas": 12
}
```

---

## 10. Consignações — Quitar Consignação

Finaliza a consignação e libera margem utilizada.

```bash
curl -X PUT http://localhost:3333/v1/consignacoes/uuid-consignacao/quitar \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{}'
```

**Resposta esperada (200 OK):**

```json
{
  "id": "uuid-consignacao",
  "status_fluxo": "QUITADA",
  "data_quitacao": "2026-05-07T21:00:00.000Z",
  "margem_liberada": 5965.25
}
```

---

## 11. Consignações — Cancelar

Cancela a consignação (SOLICITADA ou APROVADA) e libera margem reservada.

```bash
curl -X PUT http://localhost:3333/v1/consignacoes/uuid-consignacao/cancelar \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{}'
```

**Resposta esperada (200 OK):**

```json
{
  "id": "uuid-consignacao",
  "status_fluxo": "CANCELADA",
  "data_cancelamento": "2026-05-07T21:30:00.000Z",
  "motivo": "Cancelada pelo usuário"
}
```

---

## 12. Consignações — Portabilidade

Transfere consignação para outra consignatária/produto.

```bash
curl -X POST http://localhost:3333/v1/consignacoes/uuid-consignacao/portabilidade \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
           "consignataria_id_nova": "uuid-consignataria-2",
           "produto_id_novo": "uuid-produto-2",
           "taxa_juros_nova": 1.2
         }'
```

**Resposta esperada (201 Created):**

```json
{
  "id": "uuid-consignacao-novo",
  "status_fluxo": "PORTADA",
  "tipo_operacao": "PORTABILIDADE",
  "contrato_origem_id": "uuid-consignacao",
  "consignataria_id_nova": "uuid-consignataria-2",
  "taxa_juros_nova": 1.2,
  "cet_percentual_novo": 15.39,
  "data_criacao": "2026-05-07T22:00:00.000Z"
}
```

---

**Nota**: Substitua todos os UUIDs pelos valores reais da sua base de dados.
**Autenticação**: Todos os endpoints (exceto `/health` e `/v1/auth/login`) requerem token JWT válido.

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
