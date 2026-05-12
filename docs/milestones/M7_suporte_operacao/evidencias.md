# Evidências de Funcionalidades - Milestone 7

**Status:** ⏳ PLANEJADO — Será preenchido durante implementação

As funcionalidades de M7 serão integradas em produção AWS conforme progresso.

---

## Fase 1: Infraestrutura & CI/CD

### Evidência A1.1: Terraform Apply Output
**Esperado:** Log de sucesso com recursos criados  
**Arquivo:** `terraform/apply-output.log`  
**Status:** ⏳ Pendente

### Evidência A1.2: GitHub Actions Workflow
**Esperado:** .github/workflows/deploy.yml funcional  
**Arquivo:** [.github/workflows/deploy.yml](../../../.github/workflows/deploy.yml)  
**Status:** ⏳ Pendente

### Evidência A1.3: ECS Services Running
**Esperado:** 2 serviços (API, Web) com tasks healthy  
**Screenshot:** AWS ECS console  
**Status:** ⏳ Pendente

### Evidência A1.4: CloudWatch Dashboards
**Esperado:** Dashboard consolidado com 10+ métricas  
**Screenshot:** CloudWatch console  
**Status:** ⏳ Pendente

---

## Fase 2: Monitoramento & Runbooks

### Evidência A2.1: CloudWatch Alarms
**Descrição:** 10+ alarms configurados (CPU, Memory, Error Rate, etc)  
**Status:** ⏳ Pendente

### Evidência A2.2: Runbooks Documentados
**Descrição:** 10+ procedimentos de troubleshooting  
**Arquivo:** `docs/milestones/M7_suporte_operacao/runbooks/` (será criado)  
**Runbooks:**
- `01-api-crashes.md` — Diagnóstico e restart
- `02-db-connection-pool.md` — Escalação de conexões
- `03-high-latency.md` — Análise de performance
- `04-memory-leak.md` — Detecção e restart
- `05-ssl-cert-expiry.md` — Renovação de certificado
- `06-ddos-attack.md` — Mitigação WAF
- `07-rds-failover.md` — Verificação de failover
- `08-secrets-rotation.md` — Rotação AWS Secrets Manager
- `09-deploy-rollback.md` — Reverter blue-green deploy
- `10-database-restore.md` — Restore de snapshot

**Status:** ⏳ Pendente

### Evidência A2.3: Escalation Procedures
**Descrição:** L1/L2/L3 contact list + SLA agreement  
**Arquivo:** `docs/milestones/M7_suporte_operacao/escalation.md`  
**Status:** ⏳ Pendente

---

## Fase 3: Load Testing & Security

### Evidência A3.1: Load Test Report (k6)
**Descrição:** 1000 concurrent users test result  
**Arquivo:** `reports/k6-load-test.json`  
**Targets:**
- P95 latency: < 1s ✓
- Error rate: < 0.1% ✓
- Throughput: > 100 req/sec ✓

**Status:** ⏳ Pendente

### Evidência A3.2: OWASP ZAP Security Scan
**Descrição:** Automated security vulnerability scan  
**Arquivo:** `reports/owasp-zap-scan.html`  
**Status:** ⏳ Pendente

### Evidência A3.3: SSL/TLS Certificate
**Descrição:** Valid AWS Certificate Manager certificate  
**Command:** `openssl s_client -connect api.macaeprev.gov.br:443`  
**Status:** ⏳ Pendente

---

## Fase 4: Go-live

### Evidência A4.1: Pre-deployment Checklist
**Descrição:** Todos itens validados antes de deploy  
**Arquivo:** `docs/milestones/M7_suporte_operacao/go-live-checklist.md`  
**Status:** ⏳ Pendente

### Evidência A4.2: Blue-Green Deployment Success
**Descrição:** Deploy executado com sucesso, health checks passing  
**Log:** GitHub Actions deploy job log  
**Status:** ⏳ Pendente

### Evidência A4.3: Post-deployment Smoke Tests
**Descrição:** E2E tests passando em produção  
**Arquivo:** `reports/smoke-tests-prod.json`  
**Tests:**
- Login + MFA + LGPD: ✓
- CRUD Consignacoes: ✓
- Export CSV: ✓
- BI Dashboard: ✓

**Status:** ⏳ Pendente

### Evidência A4.4: 24h Monitoring Log
**Descrição:** Zero-incident monitoring logs (primeiras 24h em prod)  
**Arquivo:** `logs/production-24h.log`  
**Metrics:**
- Error rate: < 0.05% ✓
- P95 latency: < 800ms ✓
- Uptime: 100% ✓

**Status:** ⏳ Pendente

---

## Artefatos Finais

Ao término de M7, os seguintes artefatos estarão disponíveis:

| Artefato | Localização | Status |
|----------|-----------|--------|
| Terraform state | `terraform/terraform.tfstate` | ⏳ |
| CI/CD pipeline | `.github/workflows/deploy.yml` | ⏳ |
| CloudWatch dashboards | AWS CloudWatch console | ⏳ |
| Runbooks | `docs/milestones/M7_suporte_operacao/runbooks/` | ⏳ |
| Load test report | `reports/k6-load-test.json` | ⏳ |
| Security scan report | `reports/owasp-zap-scan.html` | ⏳ |
| Go-live checklist | `docs/milestones/M7_suporte_operacao/go-live-checklist.md` | ⏳ |
| Post-mortem (se necessário) | `docs/milestones/M7_suporte_operacao/post-mortem.md` | ⏳ |

---

**Próximo:** Iniciar Fase 1 (Semana 1) e preencher este documento com evidências reais conforme progresso.
