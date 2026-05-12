# Infraestrutura AWS para MACAEPREV — Terraform

Este diretório contém a definição da infraestrutura definitiva em Terraform.

## Estrutura

```
terraform/
├── main.tf                  # Configurações principais
├── variables.tf             # Declaração de variáveis
├── outputs.tf               # Outputs de valores importantes
├── terraform.tfvars         # Valores específicos (não commitar)
├── terraform.tfvars.example # Exemplo de valores
├── modules/
│   ├── vpc/                 # VPC, subnets, NAT, security groups
│   ├── rds/                 # RDS (PostgreSQL) database
│   ├── ecr/                 # ECR repositories (api, web)
│   ├── ecs/                 # ECS cluster, task definitions, services
│   ├── alb/                 # Application Load Balancer
│   ├── s3/                  # S3 buckets e policies
│   ├── cloudfront/          # CloudFront distribution
│   └── iam/                 # IAM roles e policies
└── environments/
    ├── prod.tfvars          # Valores para produção
    └── staging.tfvars       # Valores para staging
```

## Pré-requisitos

- Terraform >= 1.5.0
- AWS CLI v2 configurado com credenciais
- Conta AWS com permissões suficientes

## Como usar

### Inicializar backend remoto (S3 + DynamoDB para lock)

```bash
cd terraform
terraform init -backend-config="bucket=macaeprev-terraform-state" \
  -backend-config="key=prod/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="dynamodb_table=terraform-locks"
```

### Plan

```bash
terraform plan -var-file=environments/prod.tfvars
```

### Apply

```bash
terraform apply -var-file=environments/prod.tfvars
```

### Destroy (CUIDADO!)

```bash
terraform destroy -var-file=environments/prod.tfvars
```

## Componentes provisionados

1. **VPC:** Rede privada com subnets públicas e privadas, NAT Gateway
2. **RDS:** PostgreSQL com snapshots automáticos, multi-AZ (optional)
3. **ECR:** Repositories para `macaeprev-api` e `macaeprev-web`
4. **ECS:** Cluster Fargate com serviços, auto-scaling, task definitions
5. **ALB:** Load balancer com listeners para `/v1` (API) e `/` (Web)
6. **S3:** Buckets para armazenamento de arquivos e uploads
7. **CloudFront:** CDN para cache de assets estáticos
8. **IAM:** Roles least-privilege para ECS, RDS, S3, ECR

## Migração de dados

Após aplicar a infraestrutura:

```bash
# SSH/bastion para executar migrations (ou usar AWS Systems Manager Session Manager)
AWS_REGION=us-east-1 \
DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/macaeprev" \
npx prisma migrate deploy

# Ou via container task one-off no ECS
aws ecs run-task \
  --cluster macaeprev-prod \
  --task-definition macaeprev-api:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["npx","prisma","migrate","deploy"]}]}'
```

## Referência rápida de custos (estimativa)

- RDS PostgreSQL (db.t4g.micro): ~USD 30/mês
- ECS Fargate (2 vCPU, 4GB, 0.5M requests): ~USD 100/mês
- ALB: ~USD 20/mês
- Data transfer: ~USD 10-50/mês
- S3: ~USD 5-20/mês

**Total estimado:** ~USD 165-240/mês (valores aproximados)

## Suporte

Para adicionar/modificar módulos ou ajustar configurações, consulte o código em `terraform/modules/`.
