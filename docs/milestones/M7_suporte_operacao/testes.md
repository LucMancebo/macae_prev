# Caderno de Testes - Milestone 7

**Suíte de Testes:** Infraestrutura, Load, Security, Go-live  
**Módulo:** Operação e Produção

## Status: ⏳ PLANEJADO

Os testes serão executados durante as fases de M7.

## Cenários de Teste Planejados

### Testes de Infraestrutura

#### IT01 — ECS Task Health Check
- **Descrição:** Tasks de API e Web reportam healthy
- **Método:** AWS ECS console + health check endpoint
- **Critério de Sucesso:** Health check passing para 2/2 tasks
- **Status:** ⏳ Planejado

#### IT02 — RDS Failover
- **Descrição:** Multi-AZ failover automático funciona
- **Método:** Simular AZ failure
- **Critério de Sucesso:** Failover completa em < 2 min, app reconecta
- **Status:** ⏳ Planejado

#### IT03 — CloudFront Cache
- **Descrição:** Cache de assets funciona
- **Método:** Verificar cache hits em CloudWatch
- **Critério de Sucesso:** > 80% cache hit rate
- **Status:** ⏳ Planejado

### Load Testing

#### LT01 — 1000 Concurrent Users
- **Descrição:** Sistema aguenta 1000 users simultâneos
- **Método:** k6 load test
- **Critério de Sucesso:** P95 latency < 1s, erro rate < 0.1%
- **Status:** ⏳ Planejado

#### LT02 — Dashboard BI com 100k Records
- **Descrição:** BI dashboard carrega com 100k consignacoes
- **Método:** Seed 100k dados; medir tempo de carregamento
- **Critério de Sucesso:** Load time < 5s
- **Status:** ⏳ Planejado

#### LT03 — Exportação CSV 10MB
- **Descrição:** Export de arquivo grande não falha
- **Método:** Gerar CSV de 10MB; exportar
- **Critério de Sucesso:** Download completa, não timeout
- **Status:** ⏳ Planejado

### Security Testing

#### ST01 — OWASP ZAP Scan
- **Descrição:** Verificar vulnerabilidades comuns (OWASP Top 10)
- **Método:** OWASP ZAP automated scan
- **Critério de Sucesso:** 0 issues críticas, ≤ 3 high issues
- **Status:** ⏳ Planejado

#### ST02 — SSL/TLS Validation
- **Descrição:** Certificado SSL válido
- **Método:** OpenSSL s_client check
- **Critério de Sucesso:** TLS 1.2+, válido por > 30 dias
- **Status:** ⏳ Planejado

### Smoke Tests (Pós-deploy)

#### ST01 — Login Flow
- **Descrição:** Autenticação funciona em produção
- **Método:** E2E test (Playwright)
- **Critério de Sucesso:** Login + MFA + LGPD completa com sucesso
- **Status:** ⏳ Planejado

#### ST02 — CRUD Consignacoes
- **Descrição:** Operações de consignações funcionam
- **Método:** Create, read, update, delete consignação
- **Critério de Sucesso:** Todas operações bem-sucedidas
- **Status:** ⏳ Planejado

#### ST03 — Export CSV
- **Descrição:** Exportação de dados funciona
- **Método:** Download CSV e validar formato
- **Critério de Sucesso:** Arquivo válido, UTF-8 encoded
- **Status:** ⏳ Planejado

---

## Matriz de Testes Consolidada

| ID | Teste | Tipo | Fase | Status |
|----|-------|------|------|--------|
| IT01-03 | Infraestrutura (3 testes) | Infrastructure | Sem 1 | ⏳ |
| LT01-03 | Load Testing (3 testes) | Performance | Sem 2 | ⏳ |
| ST01-02 | Security (2 testes) | Security | Sem 2 | ⏳ |
| Smoke01-03 | Smoke Tests (3 testes) | E2E | Sem 2 | ⏳ |
| **Total** | **11 testes** | **Misto** | **2 semanas** | ⏳ |

---

**Próximo Passo:** Iniciar M7 e preencher este documento com resultados reais.
