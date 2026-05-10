# Plano e Resultados de Testes — Milestone 2

## 1. Resumo dos Testes

Foram realizados testes de ponta a ponta (E2E) para garantir a integridade do fluxo de autenticação e segurança.

## 2. Casos de Teste — Autenticação

| ID   | Descrição                | Entrada                     | Resultado Esperado                        | Status    |
| ---- | ------------------------ | --------------------------- | ----------------------------------------- | --------- |
| CT01 | Login com Sucesso        | Email/Senha válidos         | Status 200 + JWT Token em cookie          | ✅ PASSOU |
| CT02 | Senha Incorreta          | Email válido + Senha errada | Status 401 + Erro credenciais             | ✅ PASSOU |
| CT03 | Incremento de Tentativas | Senha incorreta             | Campo `tentativas_login` aumenta          | ✅ PASSOU |
| CT04 | Bloqueio de Usuário      | 5 tentativas falhas         | Status 401 + Mensagem de bloqueio (30min) | ✅ PASSOU |
| CT05 | Reset de Tentativas      | Login bem-sucedido          | `tentativas_login` volta a 0              | ✅ PASSOU |
| CT06 | Acesso Protegido (/me)   | Token JWT válido            | Status 200 + Dados do usuário             | ✅ PASSOU |
| CT07 | Acesso Sem Token         | Nenhuma credencial          | Status 401                                | ✅ PASSOU |
| CT08 | Healthcheck              | GET /health                 | Status 200 + Status OK                    | ✅ PASSOU |

## 3. Casos de Teste — MFA

| ID   | Descrição           | Entrada                   | Resultado Esperado          | Status    |
| ---- | ------------------- | ------------------------- | --------------------------- | --------- |
| CT09 | Gerar QR Code MFA   | User ID válido            | QR code + secret temporário | ✅ PASSOU |
| CT10 | Confirmar MFA       | Código TOTP válido        | Status 200 + MFA ativado    | ✅ PASSOU |
| CT11 | Login com MFA       | Email/Senha + Código TOTP | Status 200 + JWT Token      | ✅ PASSOU |
| CT12 | Código MFA Inválido | Código incorreto          | Status 401 + Erro validação | ✅ PASSOU |

## 4. Casos de Teste — LGPD

| ID   | Descrição                  | Entrada                      | Resultado Esperado              | Status    |
| ---- | -------------------------- | ---------------------------- | ------------------------------- | --------- |
| CT13 | Obter Termos Vigentes      | GET /terms                   | Status 200 + Versão atual       | ✅ PASSOU |
| CT14 | Aceitar Termos             | POST /acceptTerms com versão | Status 200 + Registro de aceite | ✅ PASSOU |
| CT15 | Rejeitar Acesso sem Aceite | Usuário sem aceite           | Status 403 + Mensagem LGPD      | ✅ PASSOU |
| CT16 | Auditoria de Aceite        | Registros de termoUso        | IP, User-Agent, Data/Hora       | ✅ PASSOU |

## 5. Comandos para Execução

Para reproduzir os testes localmente com Docker:

```bash
cd api
npm run test:local-db
```

Para usar banco de dados Vercel (requer env vars):

```bash
cd api
npm run test:vercel-db
```

Para rodar suite completa (sem Docker):

```bash
cd api
npm run test
```

## 6. Ambiente de Teste

- **Node.js**: v18+
- **Database**:
  - Local: PostgreSQL 15 Alpine via Docker Compose
  - Vercel: Neon PostgreSQL (configurável)
- **Framework**: Jest v30 + Supertest + ts-jest
- **Total de Testes**: 16 casos
- **Taxa de Sucesso**: 100% (16/16 passando com `npm run test:local-db`)
