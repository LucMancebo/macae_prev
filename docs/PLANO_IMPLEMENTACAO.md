# Plano de Implementação — Decisões Arquiteturais & Mapeamento POC/Licitação

**Data:** 12 de maio de 2026  
**Status:** Consolidado após M1–M5  
**Próximas fases:** M6 (Frontend UX), M7 (Suporte & Operação)

---

## 📋 Resumo Executivo

O sistema MACAEPREV foi implementado em 5 milestones (M1–M5), cobrindo:

- ✅ Infraestrutura (M1)
- ✅ Segurança & Autenticação (M2)
- ✅ Núcleo de Consignações (M3)
- ✅ Integração com Folha/CSV (M4)
- ✅ Relatórios & BI (M5)

A stack definitiva é **AWS (ECS/Fargate, RDS, S3, CloudFront)**, com CI/CD contínuo via **GitHub Actions**.

---

## 🏗️ Stack Tecnológico Definitivo

| Camada            | Tecnologia         | Versão LTS | Rationale                                              |
| ----------------- | ------------------ | ---------- | ------------------------------------------------------ |
| **Runtime**       | Node.js            | 24.x       | Suporte de longo prazo até 2026                        |
| **Linguagem**     | TypeScript         | 6.x        | Type safety, evita bugs em produção                    |
| **Backend**       | Fastify            | 5.8.5      | Performático, suporta plugins (JWT, CORS, Swagger)     |
| **Frontend**      | Next.js            | 15.1.0     | SSR, incremental static regen, API routes              |
| **ORM**           | Prisma             | 6.19.3     | Type-safe, migrações automáticas                       |
| **DB**            | PostgreSQL         | 13+ (RDS)  | Suporte ACID, JSON, extensões (UUID, full-text search) |
| **Autenticação**  | JWT (Fastify)      | —          | Stateless, escalável, LGPD-compliant                   |
| **2FA**           | TOTP (otplib)      | 12.0.1     | QR code, apps padrão (Google Authenticator)            |
| **Hospedagem**    | AWS ECS (Fargate)  | —          | Serverless containers, elasticidade automática         |
| **CDN**           | CloudFront         | —          | Cache global, HTTPS obrigatório                        |
| **Observability** | CloudWatch + X-Ray | —          | Logs, metrics, distributed tracing                     |

---

## 🎯 Mapeamento de Requisitos (Licitação 4.1.x)

### R1 — Cenários de Uso

| POC                 | Requisito              | Implementação                                   | Status |
| ------------------- | ---------------------- | ----------------------------------------------- | ------ |
| 1,15,23,29          | Fundação técnica       | API REST, DB schema, versionamento              | ✅ M1  |
| 6,12,24,28          | Login MFA, LGPD        | JWT + TOTP + Terms acceptance                   | ✅ M2  |
| 3,4,5,7–11,16,20,21 | Gestão de consignações | Contratos, margens, portabilidade, renegociação | ✅ M3  |
| 2,17–19             | Integração CSV (folha) | Upload, parsing, reconciliação com tolerância   | ✅ M4  |
| 10,14,22,30         | BI & Relatórios        | Dashboards Recharts, exportação, auditoria      | ✅ M5  |
| 1,13,15             | UX/UI frontend         | Páginas CRUD, formulários, notificações         | ⏳ M6  |
| 25–27               | Operação e suporte     | Hotline, escalação, SLA tracking                | ⏳ M7  |

---

## 🔐 Requisitos de Segurança (LGPD & Conformidade)

| Requisito                       | Implementação                                       | Verificação                                  |
| ------------------------------- | --------------------------------------------------- | -------------------------------------------- |
| **Criptografia em repouso**     | Senhas Bcrypt (salt dinâmico), RDS encryption (KMS) | `bcryptjs`, AWS RDS settings                 |
| **Criptografia em trânsito**    | TLS 1.2+, HTTPS obrigatório                         | ALB listener SSL/TLS, CloudFront             |
| **Rate-limiting (força bruta)** | Bloqueio 30min após 5 tentativas                    | `usuario.tentativas_login`, `bloqueado_ate`  |
| **Segregação de dados**         | RLS (Row-Level Security) via Prisma filters         | Controllers validam `consignataria_id`       |
| **Imutabilidade de auditoria**  | `LogAuditoria` não deletável, IP+UA capturados      | Triggers PostgreSQL, soft-delete             |
| **Conformidade LGPD**           | Aceite de termos (`AceiteTermo`), anonimização      | `/v1/auth/accept-terms`, mascaramento de CPF |

---

## 📊 Regras de Negócio Implementadas

| RN       | Descrição                                | Implementação                                             |
| -------- | ---------------------------------------- | --------------------------------------------------------- |
| **RN01** | Limite de margem exclusiva/compartilhada | `MargemServidor.valor_disponivel`, validação no averbação |
| **RN02** | CET máximo do produto                    | `Produto.cet`, validação em `Contrato.create()`           |
| **RN03** | Segregação por consignatária             | `Usuario.consignataria_id` filtrado em queries            |
| **RN04** | Reconciliação com tolerância R$ 0,05     | `reconciliacao.ts` compara valores com margem             |
| **RN05** | Imutabilidade de logs                    | `LogAuditoria` sem DELETE, FK de `Usuario`                |

---

## 🚀 CI/CD & Deployment

### Pipeline GitHub Actions (`.github/workflows/ci.yml`)

```
trigger: push main/develop, PR
  ↓
Lint + Type Check (TS 6.x, ESLint)
  ↓
Build (tsc, next build)
  ↓
Unit Tests (Jest, sem DB externo)
  ↓
Generate OpenAPI (docs/integracao/openapi.json)
  ↓
Security Audit (npm audit, grep secrets)
  ↓
Build Docker (api:24-alpine, web:24-alpine)
  ↓
Push to ECR (se main/develop)
  ↓
Deploy ECS (manual ou via second workflow)
```

### Infraestrutura Terraform

```
├── vpc/              → VPC, subnets, NAT, security groups
├── rds/              → PostgreSQL 13+ (Multi-AZ optional)
├── ecr/              → Repositories macaeprev-api, macaeprev-web
├── ecs/              → Fargate cluster, task definitions, services
├── alb/              → ALB + listeners (/v1 → API, / → Web)
├── s3/               → Buckets (files, uploads, logs)
├── cloudfront/       → CDN, cache policies
└── iam/              → Roles least-privilege
```

---

## 📈 Performance & Disponibilidade

| Métrica                          | Target     | Implementação                              |
| -------------------------------- | ---------- | ------------------------------------------ |
| **Latência P95**                 | <200ms     | Prisma query optimization, RDS indexing    |
| **Throughput**                   | 1000 req/s | ECS auto-scaling, ALB target group scaling |
| **Uptime**                       | 99%+       | Multi-AZ RDS, Fargate health checks        |
| **Reconciliação (5k registros)** | <10s       | CSV streaming, Prisma batch operations     |
| **Cache Hit Rate**               | >80%       | CloudFront behaviors, S3 versioning        |

---

## 📝 Versionamento & Rollback

### Versionamento de Imagens Docker

```bash
# main branch → latest
docker push $ECR/macaeprev-api:latest
docker push $ECR/macaeprev-api:sha-abc1234

# develop branch → develop tag
docker push $ECR/macaeprev-api:develop
```

### Rollback Rápido (ECS)

```bash
# Reverter task definition para versão anterior
aws ecs describe-task-definition \
  --task-definition macaeprev-api:N \
  --query 'taskDefinition' > task-def.json

# Update service com versão anterior
aws ecs update-service \
  --cluster macaeprev-prod \
  --service macaeprev-api-service \
  --task-definition macaeprev-api:N-1 \
  --force-new-deployment
```

---

## 📚 Documentação de Referência

- **Arquitetura & Especificações:** [docs/tecnico/especificacoes_tecnicas.md](../tecnico/especificacoes_tecnicas.md)
- **Setup Desenvolvedor:** [docs/manual_desenvolvedor.md](../manual_desenvolvedor.md)
- **Deploy AWS:** [docs/manual_deploy.md](../manual_deploy.md)
- **OpenAPI:** [docs/integracao/openapi.json](integracao/openapi.json)
- **Segurança & Secrets:** [docs/SECURITY.md](../SECURITY.md)
- **Licitação Original:** [docs/licitacao/requisitos.md](../licitacao/requisitos.md)
- **POCs Respondidas:** [docs/poc/Poc_respondida.md](../poc/Poc_respondida.md)

---

## 🔮 Próximas Fases (M6, M7)

### M6 — Frontend & UX (⏳ Planejado)

- Refinar componentes React 19 (forms, modals, tables)
- Implementar design system completo (CSS variables, glassmorphism)
- Testes E2E com Playwright/Cypress
- Performance: Core Web Vitals otimizados
- Acessibilidade: WCAG 2.1 AA

### M7 — Suporte & Operação (⏳ Planejado)

- Procedimentos runbook (escalação, incident response)
- Dashboards de SLA (alertas, paging)
- Treinamento de operadores
- Suporte técnico (hotline, ticket system)

---

## ✅ Checklist de Produção

- [ ] Terraform apply em prod com Multi-AZ RDS
- [ ] GitHub Actions secrets configurados (AWS_ACCESS_KEY_ID, etc.)
- [ ] RDS backup schedule validado
- [ ] CloudWatch alarms configurados (errors, latency, disk)
- [ ] WAF rules habilitadas na CloudFront
- [ ] SSL certificate (ACM) válido por >1 ano
- [ ] DNS CNAME apontando para ALB/CloudFront
- [ ] Load testing (>1000 req/s) validado
- [ ] LGPD compliance checklist completo
- [ ] Runbook de rollback testado
- [ ] SLA agreements assinados
- [ ] Treinamento de operadores concluído

---

**Próximo passo:** Integração com ambiente staging AWS e validação de performance em carga.
