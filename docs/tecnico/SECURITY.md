**Segurança & Gestão de Segredos**

Este arquivo descreve regras operacionais para evitar vazamento de segredos no repositório.

## Regras rápidas

- Nunca commitar arquivos `.env` ou arquivos que contenham chaves/credentials.
- Use o **AWS Secrets Manager** (ou Vercel/1Password) para armazenar `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` e outros segredos.
- Adicione exemplos não sensíveis em `*.example` (por exemplo `api/.env.example`) e comente explicitamente que são placeholders.

## .gitignore — Verificação

O repositório já ignora os arquivos de ambiente comuns. **Confirme que esses padrões existem** em:

- `/.gitignore` (raiz)
- `api/.gitignore`
- `web/.gitignore`

**Padrões recomendados:**

```
.env
.env.local
.env.*.local
.env.production.local
.env.development.local
.env.test.local
*.pem
*.key
*.crt
.aws/
.ssh/
credentials*
secrets*
```

**Verificar se está ignorando:**

```bash
# Rodar para validar
git check-ignore .env
git check-ignore api/.env.local
```

## CI/CD — Detecção de Secrets

O workflow `.github/workflows/ci.yml` inclui uma tarefa `security-checks` que:

1. **Busca por padrões de secrets** (DATABASE_URL, JWT_SECRET, AWS_SECRET) em arquivos tracked
2. **Rodar audit de npm** para detectar vulnerabilidades conhecidas
3. **Rejeitar push** se encontrar padrões suspeitos

Para rodar localmente:

```bash
grep -r "DATABASE_URL\|JWT_SECRET\|AWS_SECRET" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist .
```

Se encontrar um secret acidentalmente commitado:

1. **Rotacione o segredo** no AWS Secrets Manager/Vercel imediatamente
2. Considere remover dos commits históricos:
   ```bash
   # CUIDADO: operação disruptiva para colaboradores
   git filter-repo --replace-text <(echo "DATABASE_URL=xxx==>DATABASE_URL=REDACTED")
   git push --force-with-lease
   ```

## Boas práticas de armazenamento

### Vercel (ambiente de desenvolvimento)

- Armazenar em Vercel Dashboard > Settings > Environment Variables
- Não copiar valores localmente; usar `.env.local` apenas para testes

### AWS (produção)

- Usar **AWS Secrets Manager** para:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `JWT_SECRET`
  - `SENTRY_DSN`
  - `PRISMA_SEED_PASSWORD` (admin)
- Usar **Parameter Store** para valores não-sensíveis:
  - `NODE_ENV=production`
  - `LOG_LEVEL=info`
  - Nomes de buckets S3

**Rotação de secrets:**

- Database passwords: a cada 90 dias
- JWT_SECRET: a cada 180 dias ou após incident
- API keys: a cada 12 meses

### GitHub Actions (CI/CD)

- Armazenar em **GitHub Settings > Secrets and variables > Repository secrets**
- Nomes recomendados:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_ACCOUNT_ID`
  - `DOCKER_REGISTRY_PASSWORD` (se não usar IAM roles)

## Auditoria e Logs

- **CloudWatch Logs:** Todos os acessos a banco são logados (via `LogAuditoria`)
- **S3 Access Logs:** Habilitar para buckets sensíveis
- **VPC Flow Logs:** Rastrear tráfego de rede suspeito

## LGPD & Anonimização

- Senhas sempre armazenadas com hash Bcrypt (salt dinâmico)
- CPF é único mas mascarado em APIs (ex: `###.###.###-XX`)
- Dados deletados não podem ser recuperados (soft-delete com flag `is_deleted`)

## Remediação em caso de vazamento

1. **Rotacione credenciais** imediatamente no provedor
2. **Avise a equipe** e comunique aos stakeholders
3. **Rebase branches** que tocaram no arquivo sensível
4. **Auditar logs** (CloudWatch, AWS CloudTrail) para detectar uso do secret vazado
