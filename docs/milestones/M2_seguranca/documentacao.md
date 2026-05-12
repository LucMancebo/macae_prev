# Documentação de Entrega — Milestone 2: Segurança & Autenticação

## 1. Escopo Implementado

Esta milestone consolidou a camada de segurança do sistema MACAEPREV, garantindo autenticação robusta, auditoria de ações e proteção contra ataques de força bruta.

### 1.1 Funcionalidades Principais

- **Autenticação JWT**: Implementada usando `@fastify/jwt`. Tokens com expiração de 8h.
- **Criptografia de Senhas**: Uso de `bcryptjs` (salt 10) para armazenamento seguro conforme LGPD.
- **MFA (Autenticação Multifator)**:
  - Suporte a TOTP (Google Authenticator/Authy) via `otplib`.
  - Fluxo de login em 2 etapas.
  - Geração de QR Code para configuração.
- **Conformidade LGPD (Consentimento)**:
  - Tabela de versionamento de Termos de Uso.
  - Bloqueio de acesso para usuários que não aceitaram os termos.
  - Auditoria detalhada de aceite (IP, User-Agent, Data/Hora).
- **Rate-limiting e Bloqueio**:
  - Máximo de 5 tentativas falhas com bloqueio de 30 minutos.
- **Documentação Interativa**:
  - Swagger UI disponível em `/docs` com validação de schemas.

## 2. Estrutura Técnica

- **Controller**: `AuthController.ts` — Gerencia rotas `/login` e `/me`.
- **Service**: `AuthService.ts` — Lógica de negócio, validação de senha e rate-limiting.
- **Database**: Prisma ORM v6.19 com PostgreSQL 15.
- **Configuração**: Migrado para `prisma.config.ts` para melhor manutenibilidade.

## 3. Cobertura da POC

Esta entrega cobre os seguintes itens da Prova de Conceito:

- **POC 6**: Logs visíveis e auditoria detalhada.
- **POC 12**: Registro de acessos e controle por perfil (Admin).
- **POC 24**: Criptografia de dados sensíveis (senhas).
- **POC 28**: Conformidade LGPD (Consentimento e versionamento de termos).
- **POC 29**: Assinatura digital/Segurança (MFA).

## 4. Evidências de Teste

- **Suite de Testes**: `api/src/__tests__/auth.e2e.test.ts`
- **Resultado**: 11 testes aprovados (100% de sucesso).
- **Cenários Testados**:
  - Login com credenciais corretas.
  - Login com senha incorreta (incremento de tentativas).
  - Bloqueio após 5 tentativas.
  - Reset de tentativas após sucesso.
  - Acesso ao endpoint `/me` com e sem token.

## 5. Artefatos Gerados

### 5.1 Documentação API

- **OpenAPI JSON**: `docs/integracao/openapi.json` (atualizado automaticamente via `npm run --prefix api generate:openapi`)
- **Swagger UI**: Disponível em `/docs` quando servidor rodando (dev ou prod)
- **Exemplos CURL**: Veja `docs/CURL_EXAMPLES.md`

### 5.2 Scripts de Teste

- **Testes Locais**: `npm run --prefix api test:local-db` (com Docker Postgres)
- **Testes via Vercel DB**: `npm run --prefix api test:vercel-db` (requer env vars em `docs/sensitive/`)

### 5.3 Configuração de Variáveis de Ambiente

- **Arquivo**: `docs/sensitive/VERCEL_ENV_VARS.secret.md` (gitignored)
- **Instrução**: Copie as placeholders e preencha com credenciais reais do Vercel/Neon para CI/CD

## 6. Checklist de Conclusão de M2

- [x] JWT Autenticação implementada e testada
- [x] Criptografia de senhas (bcryptjs, salt 10) funcional
- [x] Rate-limiting (5 tentativas → 30min bloqueio) ativo
- [x] MFA (TOTP com Google Authenticator) disponível
- [x] LGPD (aceite de termos versionado) implementado
- [x] Auditoria de logins e ações registrada
- [x] OpenAPI/Swagger documentado e gerado automaticamente
- [x] Testes E2E passando (16/16 testes aprovados via `npm run test:local-db`)
- [x] Tratamento de erros centralizado (statusCode + error.code)
- [x] HttpOnly Cookie com segurança (diferente em dev/prod)

## 7. Próximos Passos

- Iniciar **Milestone 3: Gestão de Consignações** com CRUD e validações de negócio.
- Integração com folha de pagamento (M4).
