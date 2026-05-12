# Termo de Aceite e Entrega - Milestone 7

**Data de Entrega Esperada:** TBD (após aprovação M6)  
**Módulo:** Suporte, Operação e Go-live em Produção AWS

## Status: ⏳ PLANEJADO

A Milestone 7 ainda não iniciou. Este documento será preenchido ao longo da execução.

## Checklist de Entrega

### Infraestrutura AWS

- [ ] VPC com subnets públicas/privadas (2 AZs)
- [ ] ALB (Application Load Balancer) configurado
- [ ] ECS cluster com 2 serviços (API, Web)
- [ ] RDS PostgreSQL Multi-AZ com backup
- [ ] CloudFront distribuição com WAF
- [ ] ECR repositories (macaeprev-api, macaeprev-web)
- [ ] NAT Gateway para outbound internet

### CI/CD Pipeline

- [ ] GitHub Actions workflow completo (.github/workflows/deploy.yml)
- [ ] Trigger: push to main/develop
- [ ] Steps: lint → build → test → Docker → ECR → ECS deploy
- [ ] Health checks pós-deploy
- [ ] Smoke tests (GET /health + app load)
- [ ] Slack notifications
- [ ] Rollback automático se falhar

### Monitoramento & Logging

- [ ] CloudWatch Logs group para API, Web, RDS
- [ ] CloudWatch Dashboards (visão consolidada)
- [ ] CloudWatch Alarms (10+ métricas)
- [ ] Email/Slack notifications para alarmes
- [ ] PagerDuty integration (optional)
- [ ] Log retention: 30 days

### Runbooks & Documentação

- [ ] 10+ runbooks de troubleshooting
- [ ] Escalation procedures documentadas
- [ ] Backup/restore procedures (RDS snapshots)
- [ ] Disaster recovery plan (RTO/RPO)
- [ ] Contact list (L1/L2/L3 support)
- [ ] SLA agreement (99.9% uptime)

### Load Testing & Security

- [ ] Load test com k6 (1000 users, 10 req/sec)
- [ ] Performance report gerado
- [ ] Security scan com OWASP ZAP
- [ ] Pentest básico completo (optional)
- [ ] Security findings remediados

### Go-live

- [ ] Backup de dados legados realizado
- [ ] Migração de dados (se necessário) validada
- [ ] Blue-green deploy executado com sucesso
- [ ] Validação pós-deploy (login, CRUD, export)
- [ ] 24h de monitoramento contínuo
- [ ] Comunicado de go-live enviado

### Treinamento

- [ ] DevOps team treinado (4h)
- [ ] Support team treinado (2h)
- [ ] Managers informados sobre SLA (1h)
- [ ] Documentação compartilhada

### Custos Finalizados

- [ ] Estimativa mensal de AWS finalizada
- [ ] Budget aprovado
- [ ] Cost allocation tags configuradas

---

## Evidências de Cumprimento

Após conclusão, as seguintes evidências serão documentadas:

- Terraform apply output
- CloudWatch dashboard screenshot
- CI/CD pipeline execution log
- Load test report (k6 summary)
- Security scan results
- Go-live validation checklist signed
- Support team sign-off

---

## Assinatura de Aceite

| Papel              | Nome | Data | Assinatura |
| ------------------ | ---- | ---- | ---------- |
| CIO / IT Director  | —    | TBD  | —          |
| DevOps Lead        | —    | TBD  | —          |
| Operations Manager | —    | TBD  | —          |
| Product Owner      | —    | TBD  | —          |

---

**Nota:** Este documento será preenchido completamente ao final de M7.
