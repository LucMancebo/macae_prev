# Dicionário de Dados - MACAEPREV

**Data:** 12 de maio de 2026
**Banco de Dados:** PostgreSQL 15+ (via Prisma ORM)

Este documento detalha as 12 entidades principais estruturadas para o funcionamento do sistema de consignação, definindo seus domínios, tipos e restrições.

## 1. Usuario

Gerencia as credenciais e acessos ao sistema.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único do usuário | PK |
| `nome` | VARCHAR | Nome completo | NOT NULL |
| `email` | VARCHAR | E-mail corporativo / login | UNIQUE, NOT NULL |
| `senha` | VARCHAR | Hash Bcrypt da senha | NOT NULL |
| `mfa_enabled` | BOOLEAN | Indica se MFA está ativo | DEFAULT false |
| `tentativas_login` | INT | Contador de bloqueio | DEFAULT 0 |
| `perfil_id` | UUID | FK para PerfilAcesso | NOT NULL |
| `consignataria_id`| UUID | FK para Consignataria | NULLABLE |

## 2. PerfilAcesso

Define níveis e permissões (RBAC).
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `nome` | VARCHAR | Nome do perfil (ADMIN, BANCO) | UNIQUE, NOT NULL |
| `permissoes` | JSONB | Objeto de claims de acesso | NOT NULL |

## 3. Servidor

Dados funcionais da folha de pagamento.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `matricula` | VARCHAR | Matrícula no MACAEPREV | UNIQUE, NOT NULL |
| `cpf` | VARCHAR | CPF do servidor | UNIQUE, NOT NULL |
| `nome` | VARCHAR | Nome completo | NOT NULL |
| `salario_base` | DECIMAL | Valor base para cálculo | NOT NULL |
| `status` | ENUM | ATIVO, INATIVO, BLOQUEADO | DEFAULT ATIVO |

## 4. Consignataria

Instituições bancárias e financeiras credenciadas.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `cnpj` | VARCHAR | CNPJ da instituição | UNIQUE, NOT NULL |
| `nome_fantasia` | VARCHAR | Nome de exibição | NOT NULL |
| `taxa_admin` | DECIMAL | % repassada ao MACAEPREV | DEFAULT 0.00 |

## 5. Produto

Modalidades de crédito liberadas no sistema.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `consignataria_id`| UUID | Dono do produto | FK, NOT NULL |
| `tipo` | ENUM | EMPRESTIMO, CARTAO, SEGURO | NOT NULL |
| `taxa_efetiva_max`| DECIMAL | Limite do CET | NOT NULL |
| `prazo_max_meses` | INT | Teto máximo de meses | NOT NULL |

## 6. Margem

Regras institucionais estáticas sobre os descontos.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `nome` | VARCHAR | Nome (ex: Margem Livre 30%) | NOT NULL |
| `percentual_limite`| DECIMAL| Percentual max da folha | NOT NULL |
| `exclusiva` | BOOLEAN | Se não permite share | DEFAULT false |

## 7. MargemServidor

Espelho em tempo real da carteira do servidor.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `servidor_id` | UUID | Vínculo com servidor | FK, NOT NULL |
| `margem_id` | UUID | Vínculo com a regra | FK, NOT NULL |
| `valor_utilizado` | DECIMAL | Total já averbado | DEFAULT 0.00 |

## 8. Contrato (Consignacao)

Averbação financeira confirmada.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `servidor_id` | UUID | Tomador do empréstimo | FK, NOT NULL |
| `produto_id` | UUID | Produto atrelado | FK, NOT NULL |
| `valor_total` | DECIMAL | Valor da operação | NOT NULL |
| `valor_parcela` | DECIMAL | Desconto mensal | NOT NULL |
| `cet_percentual` | DECIMAL | Custo Efetivo Total | NOT NULL |
| `status_fluxo` | ENUM | SOLICITADA, ATIVA, QUITADA| DEFAULT SOLICITADA|

## 9. Parcela

Títulos mensais gerados pela Consignação.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `contrato_id` | UUID | FK para o Contrato | FK, NOT NULL |
| `competencia` | VARCHAR | Mês de desconto (YYYY-MM) | NOT NULL |
| `valor` | DECIMAL | Valor a descontar | NOT NULL |
| `status` | ENUM | PREVISTA, DESCONTADA, ERRO| DEFAULT PREVISTA |

## 10. ArquivoIntegracao

Arquivos de retorno CSV/TXT processados.
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `nome_arquivo` | VARCHAR | Arquivo original importado| NOT NULL |
| `hash_md5` | VARCHAR | Prevenção de duplicidade | UNIQUE, NOT NULL |

## 11. LogAuditoria

Trilha de auditoria LGPD (Imutável).
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | Identificador único | PK |
| `usuario_id` | UUID | Quem executou a ação | FK, NOT NULL |
| `acao` | VARCHAR | Ex: CREATE_CONTRATO | NOT NULL |
| `ip_origem` | VARCHAR | Endereço IP detectado | NOT NULL |
