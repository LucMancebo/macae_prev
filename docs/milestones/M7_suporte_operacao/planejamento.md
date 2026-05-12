# Planejamento & Checklist de Implementação - Milestone 7

## Fases de Execução (2 semanas)

### Semana 1: Infraestrutura & CI/CD

**Dia 1-2: Terraform & AWS Setup**
- [ ] Review Terraform code de M1/M5
- [ ] Aplicar Terraform (VPC, ECS, RDS, CloudFront)
- [ ] Criar AWS ECR repositories (macaeprev-api, macaeprev-web)
- [ ] Configurar AWS Secrets Manager (DB credentials, JWT secrets)
- [ ] Criar CloudWatch log groups

**Dia 3-4: GitHub Actions Deploy Pipeline**
- [ ] Finalizar .github/workflows/deploy.yml
- [ ] Integrar com AWS credentials (assumeRole)
- [ ] Testar build Docker → ECR → ECS deploy
- [ ] Implementar health checks e smoke tests
- [ ] Configurar Slack notifications pós-deploy

**Dia 5: Monitoramento**
- [ ] Criar CloudWatch dashboards (API, Web, RDS)
- [ ] Configurar alarmes (CPU, Memory, Error Rate)
- [ ] Integrar com PagerDuty (opcional)
- [ ] Testar alarms com manual trigger

### Semana 2: Runbooks & Go-live

**Dia 1-2: Runbooks & Documentação**
- [ ] Escrever 10 top runbooks (issue + resolução)
- [ ] Documentar escalation procedures
- [ ] Criar guia de backup/restore
- [ ] Documentar DR procedures (RTO/RPO)

**Dia 3: Testes Pré-produção**
- [ ] Load testing com k6 (1000 users, 10 req/sec)
- [ ] Security scan com OWASP ZAP
- [ ] Smoke tests em staging
- [ ] Validação de dados legados (se aplicável)

**Dia 4-5: Go-live**
- [ ] Comunicar com stakeholders (MACAEPREV)
- [ ] Executar go-live checklist
- [ ] Monitor 24h contínuo
- [ ] Preparar comunicado de sucesso

---

## Go-live Checklist

### Antes do Deploy
- [ ] Todos os testes passando (unit + E2E)
- [ ] Lighthouse score ≥ 90
- [ ] Security review concluído
- [ ] Load test com 1000 concurrent users OK
- [ ] Backup de dados legados realizado
- [ ] CloudWatch dashboards e alarmes configurados
- [ ] Runbooks documentados e testados

### Durante o Deploy
- [ ] Executar blue-green deploy
- [ ] Monitorar error rate (deve estar < 0.1%)
- [ ] Verificar health checks de API e Web
- [ ] Testar login + MFA + LGPD flow
- [ ] Testar CRUD de consignacoes
- [ ] Testar exportação CSV
- [ ] Confirmar base de dados integridade

### Após o Deploy
- [ ] 24h de monitoramento contínuo
- [ ] Coletar feedback inicial de usuários
- [ ] Documentar issues encontrados
- [ ] Publicar post-mortem (se necessário)
- [ ] Planejar hotfixes (se necessário)

---

## Métricas de Sucesso

| Métrica | Target | Verificação |
|---------|--------|-------------|
| System uptime | ≥ 99.9% | CloudWatch logs |
| API P95 latency | < 1s | CloudWatch metrics |
| Error rate | < 0.1% | Error logs |
| Database failover time | < 2min | RDS events |
| Deploy time | < 10min | CI/CD logs |
| RTO (disaster recovery) | < 15min | DR test |

---

## Custos Estimados (AWS)

| Serviço | Custo Mensal | Notas |
|---------|--------------|-------|
| ECS Fargate (API + Web) | $150-300 | 2-5 tasks, compute + storage |
| RDS PostgreSQL Multi-AZ | $200-400 | db.t3.small → db.t3.medium |
| CloudFront CDN | $50-150 | Static assets + API edge |
| NAT Gateway | $30 | 1 AZ (2 AZ = $60) |
| CloudWatch Logs | $50-100 | 100GB/month ingestion |
| **Total Estimado** | **$480-1050/mês** | Pode variar com uso |

---

## Handoff para Operações

### Treinamento Requerido
- [ ] 4h para equipe DevOps (Terraform, ECS, RDS)
- [ ] 2h para support team (runbooks, escalation)
- [ ] 1h para managers (monitoring, SLA)

### Artefatos de Handoff
- [ ] Runbooks documentos (10+ páginas)
- [ ] Terraform repository com documentação
- [ ] CloudWatch dashboards compartilhadas
- [ ] AWS IAM roles/policies documentadas
- [ ] Contact list para suporte L1/L2/L3
- [ ] SLA agreement (99.9% uptime)

---

**Próximo:** Iniciar Semana 1 com aprovação de M6
