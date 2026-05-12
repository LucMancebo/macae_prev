# Manual de Deploy — Infraestrutura Definitiva (AWS)

Este documento descreve o plano definitivo de publicação em produção na AWS, incluindo componentes, passos de provisionamento, CI/CD e procedimentos de rollback.

Resumo da arquitetura

- Frontend: Next.js build estático servido por S3 + CloudFront (ou Next.js em Edge via Lambda@Edge, opcional).
- Backend: API Node.js em containers Docker rodando no ECS Fargate por serviço, por ambiente (prod/staging).
- Runtime recomendado

-- Node.js LTS (recomendado: Node 24.x) em containers de produção e nos runners do CI.
-- Use imagens oficiais `node:24-alpine` ou `node:24-bullseye` como base para imagens Docker de `api` e `web`.

- Banco de Dados: Amazon RDS (Postgres) ou Amazon Aurora (Postgres compatible).
- Armazenamento de arquivos: S3 (para uploads e repasses), com políticas e KMS para criptografia em repouso.
- Secrets: AWS Secrets Manager / Parameter Store para `DATABASE_URL`, `JWT_SECRET`, etc.
- Observability: CloudWatch Logs + Metrics; X-Ray (opcional) para tracing.

Provisionamento (alto nível)

1. Infraestrutura as Code (recomendado): criar templates Terraform ou CloudFormation que definam:
   - Rede (VPC, subnets públicas/privadas, NAT, Security Groups)
   - RDS (DB subnet group, backups, parâmetros de conexão)
   - ECR repositories (api/web)
   - ECS cluster + task definitions + services (autoscaling)
   - Application Load Balancer (ALB) com listener para /v1 -> API, / -> frontend
   - S3 buckets e CloudFront distribution
   - IAM roles e policies (least privilege)

2. Build e publicação de imagens (CI):
   - Build Docker images (`api` e `web`) e versionar com tag `sha-<short>` ou semver.
   - Push para Amazon ECR.

3. Migrações e seeds
   - Executar `prisma migrate deploy` no ambiente de produção com o `DATABASE_URL` apontando para o RDS.
   - Executar scripts de provisionamento (ex.: admin user) via container one-off ou via workflow controlado.

4. Rollout
   - Deploy blue/green ou rolling update via ECS services + ALB target groups.
   - Validar health checks e métricas (erros 5xx, latência) antes de promover o tráfego.

Procedimento CI/CD (GitHub Actions)

O repositório inclui um workflow automatizado em `.github/workflows/ci.yml` que:

1. Instala dependências e executa type-check (root, api, web)
2. Compila TypeScript (`tsc` para API, `next build` para Web)
3. Executa testes unitários (que não dependem de banco externo)
4. Gera `docs/integracao/openapi.json` automaticamente
5. Auditoria de npm (detecta vulnerabilidades)
6. Verifica potenciais secrets no repositório
7. **Build e push de imagens Docker para ECR** (se main/develop):
   - `api`: Node.js + Fastify (porta 3333)
   - `web`: Next.js (porta 3000)
8. Notifica status final

**Trigger:** A cada push em `main` ou `develop`, e em todos os PRs (lint/test apenas).

**Variáveis de ambiente necessárias no GitHub:**

- `AWS_ACCOUNT_ID` — ID da conta AWS
- `AWS_ACCESS_KEY_ID` — Credencial de acesso
- `AWS_SECRET_ACCESS_KEY` — Credencial secreta

**Deploy manual (post-CI):**
Após o workflow publicar as imagens em ECR, faça deploy manualmente ou configure um second workflow que:

1. Atualize a task definition do ECS com o novo `image:tag`
2. Force uma rolling update do serviço ECS
3. Monitore health checks
4. Notifique o Slack/email

Segredos e variáveis

- Armazenar `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `SENTRY_DSN`, `NODE_ENV=production` no AWS Secrets Manager.
- Usar perfis IAM para o executor do CI com permissões restritas para ECR, ECS, S3, CloudFormation/Terraform state.

Backups e DR

- Configurar snapshots automatizados do RDS (daily) e retenção conforme política do órgão.
- Para S3, habilitar versioning e lifecycle rules para retenção mínima.

Rollback rápido

1. Reverter a task definition para a versão anterior no ECS e re-associar o ALB target group.
2. Restaurar snapshot RDS se necessário (procedimento de emergência — coordene com equipe DB).

Checklist de pré-go-live

- Validar política LGPD e anonimização antes de publicar dados reais.
- Testar importação de CSV em ambiente staging com dataset realista.
- Validar performance do motor de reconciliação com lote >5k registros.
- Confirmar que `docs/integracao/openapi.json` foi gerada e arquivada.

Comandos úteis (exemplos)

```bash
# Build e push Docker (exemplo simplificado)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t api:sha-$(git rev-parse --short HEAD) -f api/Dockerfile ./api
docker tag api:sha-$(git rev-parse --short HEAD) <aws_account>.dkr.ecr.us-east-1.amazonaws.com/api:sha-$(git rev-parse --short HEAD)
docker push <aws_account>.dkr.ecr.us-east-1.amazonaws.com/api:sha-$(git rev-parse --short HEAD)

# Executar migração (executar dentro do container ou uma task one-off)
npx prisma migrate deploy --preview-feature --schema=./api/prisma/schema.prisma
```

Notas finais

Este manual descreve a stack definitiva sugerida: AWS. Se desejar, posso gerar um esqueleto Terraform/CloudFormation e um workflow GitHub Actions inicial para automatizar builds, testes, push para ECR e deploy no ECS.
