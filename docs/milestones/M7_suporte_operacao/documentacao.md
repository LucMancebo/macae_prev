# M7 — Documentação Técnica: Suporte & Operação

## 1. Visão Geral

A Milestone 7 foca na operacionalização completa do sistema MACAEPREV em produção AWS, com infraestrutura monitorada, suporte 24/7 configurado e processos de runbook documentados.

### Objetivos

- **Objetivos Funcionais:** Sistema em produção com 99.9% uptime SLA
- **Objetivos Técnicos:** CI/CD automatizado, monitoramento em tempo real, runbooks de escalação

## 2. Arquitetura de Produção

### 2.1 Compute

```
AWS ECS/Fargate
├── API Service (Node.js 24, Fastify)
│   ├── Task count: 2-5 (auto-scaling)
│   ├── CPU: 512-1024 mCPU
│   ├── Memory: 1-2 GB
│   └── Health check: GET /health
│
└── Web Service (Next.js, Node.js 24)
    ├── Task count: 2-5 (auto-scaling)
    ├── CPU: 512-1024 mCPU
    ├── Memory: 1-2 GB
    └── Health check: GET /api/health
```

### 2.2 Database

```
AWS RDS PostgreSQL 13+
├── Multi-AZ: Enabled (failover automático)
├── Backup: Automated daily + on-demand
├── Retention: 30 days
├── Read Replicas: Optional para BI
└── Connection Pool: pgbouncer (via RDS Proxy)
```

### 2.3 Storage & CDN

```
AWS CloudFront
├── Origins:
│   ├── API Gateway / ALB (api.macaeprev.gov.br)
│   ├── S3 bucket (static assets / next builds)
│   └── CloudFront edge locations (30+ global)
├── Cache behaviors:
│   ├── Static: 86400s (1 day)
│   ├── API: 0s (no cache)
│   └── HTML: 300s (5 min)
└── WAF: AWS WAF rules (DDoS, SQLi, XSS)
```

### 2.4 Networking

```
AWS VPC
├── Public Subnets: ALB, NAT Gateway (2 AZs)
├── Private Subnets: ECS tasks, RDS (2 AZs)
├── Security Groups:
│   ├── ALB: Inbound 80/443 (HTTP/HTTPS)
│   ├── ECS: Inbound 3000, 3001 (from ALB)
│   └── RDS: Inbound 5432 (from ECS security group)
└── NAT Gateway: Outbound internet access
```

## 3. CI/CD Pipeline

### 3.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
trigger: [push main, push develop]

jobs:
  1. lint-build: TypeScript, ESLint
  2. unit-tests: Jest, Vitest
  3. build-docker: Dockerfile API + Web
  4. push-ecr: AWS ECR registry
  5. deploy-ecs: UpdateService API + Web
  6. smoke-tests: POST /health, check app load
  7. notify-slack: Deploy status + link
```

### 3.2 Estratégia de Deploy

- **Main branch:** Production (blue-green deploy)
- **Develop branch:** Staging (rolling update)
- **Rollback:** Automatic if health check fails

## 4. Monitoramento & Alertas

### 4.1 CloudWatch Metrics

| Métrica            | Threshold  | Ação                         |
| ------------------ | ---------- | ---------------------------- |
| CPU Utilization    | > 80%      | Scale up ECS task count      |
| Memory Utilization | > 85%      | Alert + manual investigation |
| API Response Time  | > 1s (p95) | Alert + review logs          |
| Error Rate         | > 1%       | PagerDuty escalation         |
| RDS CPU            | > 75%      | Alert                        |
| RDS Storage        | > 80%      | Alert                        |

### 4.2 Log Aggregation

```
CloudWatch Logs
├── /aws/ecs/macaeprev-api: API logs (JSON structured)
├── /aws/ecs/macaeprev-web: Web logs
├── /aws/rds/macaeprev-db: Database slow queries
└── /aws/lambda/events: Lambda functions (if used)
```

## 5. Runbooks

### 5.1 Top 10 Issues & Resoluções

| Issue                              | Symptom                  | Resolução                                         |
| ---------------------------------- | ------------------------ | ------------------------------------------------- |
| API crashes                        | 502 Bad Gateway          | Restart ECS task; check logs in CloudWatch        |
| Database connection pool exhausted | Connection timeout       | Scale RDS or increase pool size                   |
| High API latency                   | Response time > 5s       | Check database query performance; add index       |
| Memory leak                        | Memory usage grows > 90% | Restart task; review code for leaks               |
| SSL cert expired                   | 60 day warning           | Renew in ACM; CloudFront auto-rotates             |
| S3 bucket full                     | 403 Access Denied        | Delete old backups; configure lifecycle policies  |
| DDoS attack                        | Request spike 10x        | AWS WAF auto-mitigates; verify legitimate traffic |
| Database failover                  | RDS Multi-AZ             | Auto-failover in 1-2 min; no manual action needed |
| Secrets rotation                   | Expired credentials      | Use AWS Secrets Manager for auto-rotation         |
| Blue-green deploy rollback         | Canary tests fail        | Revert to previous ECS task definition            |

### 5.2 Escalation Procedure

**L1 (DevOps/SRE):**

- Monitor dashboards 24/7
- Respond to CloudWatch alarms within 5 min
- Perform runbook diagnostics

**L2 (Architects):**

- Database performance tuning
- Infrastructure optimization
- Cost analysis

**L3 (Vendor Support):**

- AWS Support ticket (Enterprise support)
- Database vendor support (if needed)

## 6. Backup & Disaster Recovery

### 6.1 RDS Snapshots

```
Automated daily snapshots:
├── Retention: 30 days
├── Timezone: UTC
├── Timing: 02:00 UTC (off-peak)
└── Manual snapshots: Before major deployments
```

### 6.2 Recovery Time Objective (RTO) & Recovery Point Objective (RPO)

- **RTO:** 15 minutes (restore from snapshot)
- **RPO:** 1 hour (acceptable data loss)

## 7. Load Testing

### 7.1 Cenários de Teste

- 1000 concurrent users, 10 req/sec
- Dashboard BI with 100k consignacoes
- Exportação CSV de 10MB file
- 10 parallel file uploads (M4)

### 7.2 Ferramentas

- **k6:** Load testing script
- **Apache JMeter:** Alternative
- **Artillery.io:** Cloud-based load testing

---

**Referências:**

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/)
- [CloudWatch Monitoring](https://docs.aws.amazon.com/cloudwatch/)
- [RDS Backup & Recovery](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html)
