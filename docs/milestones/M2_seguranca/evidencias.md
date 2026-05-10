# Evidências de Funcionamento — Milestone 2

## 1. Testes Automatizados

A suite de testes E2E validou **16 cenários críticos** de segurança, atingindo 100% de sucesso.

### 1.1 Resultado Final

```text
Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        ~6.5 s
```

### 1.2 Executado via

```bash
npm run --prefix api test:local-db
```

Este comando:

1. Inicia Docker Compose com PostgreSQL 15 Alpine
2. Aguarda conexão na porta 15432
3. Executa `prisma db push` para schema
4. Rodas Jest com os 16 casos de teste
5. Teardown do Docker

## 2. Cobertura de Testes

- ✅ **Auth Module (Unit)**: `auth.controller.spec.ts`
- ✅ **Auth E2E**: `auth.e2e.test.ts` (5 casos)
- ✅ **Auth MFA E2E**: `auth-mfa.e2e.test.ts` (2 casos)
- ✅ **Auth LGPD E2E**: `auth-lgpd.e2e.test.ts` (1 caso)
- ✅ **Servidores E2E**: `servidores.e2e.test.ts` (2 casos, valida auth)

## 3. Logs de Auditoria

Tabela `LogAuditoria` registra corretamente:

- `LOGIN`: Sucesso no login com email/senha
- `LOGIN_MFA`: Sucesso após código TOTP
- `FALHA_LOGIN`: Tentativa com credenciais inválidas (incrementa contador)
- `MFA_ENABLE`: Ativação de MFA
- `ALTERACAO`: Aceite de termos LGPD (com IP, User-Agent, timestamp)

## 4. Segurança de Senhas

- ✅ Criptografia BCrypt (salt rounds: 10)
- ✅ Impossível ler em texto plano
- ✅ Validação com `bcrypt.compare()` em login

## 5. Taxa de Limitação & Bloqueio

- ✅ Máximo 5 tentativas de login falhas
- ✅ Bloqueio automático por 30 minutos
- ✅ Reset de contador após login bem-sucedido
- ✅ Coluna `bloqueado_ate` registra timestamp de desbloqueio

## 6. MFA & LGPD

- ✅ Geração de Secret TOTP com QR Code
- ✅ Validação de código TOTP (6 dígitos, 30s)
- ✅ Tabela `TermoUso` com versionamento
- ✅ Tabela `AceiteTermo` com auditoria completa

## 7. Documentação de API (OpenAPI/Swagger)

- ✅ Arquivo: `docs/openapi.json` (gerado automaticamente)
- ✅ Gerador: `api/scripts/generate_openapi.js`
- ✅ Endpoint Swagger: `/docs` (dev e prod)
- ✅ Inclui todos os schemas e respostas de erro

## 8. Arquivos Adicionados

- ✅ `api/scripts/test_with_local_db.js` — Runner com Docker
- ✅ `api/scripts/test_with_vercel_db.js` — Runner com Vercel DB
- ✅ `api/scripts/docker-compose.test.yml` — Compose para testes
- ✅ `api/scripts/generate_openapi.js` — Gerador OpenAPI
- ✅ `docs/sensitive/VERCEL_ENV_VARS.secret.md` — Template de env (gitignored)

## 9. Status de Conformidade

- ✅ **POC 6** (Logs): Implementado e testado
- ✅ **POC 12** (Auditoria/Perfil): Implementado
- ✅ **POC 24** (Criptografia): Implementado
- ✅ **POC 28** (LGPD): Implementado
- ✅ **POC 29** (MFA): Implementado

## 10. Checkpoint Final

**Milestone 2 — CONCLUÍDA E PRONTA PARA DEPLOY**
