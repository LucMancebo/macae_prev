# Milestone 4: Integração Folha de Pagamento

**Duração Estimada:** 4 semanas (56 horas)  
**Status:** ✅ Concluído | Backend, reconciliação e frontend de relatórios 100% entregues e validados  
**Dependências:** ✅ M1 (Fundação), ✅ M2 (Segurança), ✅ M3 (Core Consignações)  
**Objetivo:** Implementar integração de arquivos de folha de pagamento MACAEPREV, processamento de retorno e reconciliação de parcelas.

---

## 📋 Visão Geral

Milestone 4 (Integração Folha) adiciona capacidades de importação/exportação de arquivos CSV compatíveis com o sistema MACAEPREV de folha de pagamento. O módulo automatiza o fluxo de:

1. **Migração de Dados (POC 2)**: Parsing de banco de dados legado MACAEPREV em formato CSV/SQL
2. **Integração de Arquivos (POC 17-18)**: Upload/processamento de folha com byline tracking e validação
3. **Segmentação e Reconciliação (POC 19)**: Reconciliação de parcelas por consignante/consignatária com auditoria

---

## Estado Atual da Implementação

A Milestone 4 foi integralmente concluída, testada e validada com a suíte oficial `npm run test:local-db`.

- Parser CSV e utilitários de validação implementados em `api/src/utils/csv-parser.ts` e `api/src/utils/validators-arquivo.ts`.
- Service, controller e rotas de arquivos implementados em `api/src/modules/arquivos/*`.
- Schema Prisma expandido com `Arquivo`, `Repasse` e novos campos em `Parcela`.
- Testes unitários de parser/service criados e passando.
- Engine de reconciliação, dashboards gerenciais e documentação OpenAPI finalizados.

---

## 🎯 Escopo (POC Questions & GitHub Issues)

### POC Mapeadas para M4

| POC | Pergunta                                                        | GitHub Issue       | Prioridade |
| --- | --------------------------------------------------------------- | ------------------ | ---------- |
| 2   | Migração da base de dados existente (4.1.2.)                    | 4.1 - Migration    | 🔴 Alta    |
| 17  | Integração de arquivos compatível com folha MACAEPREV (4.1.14.) | 4.2 - Integration  | 🔴 Alta    |
| 18  | Arquivos mensais + processamento de retorno da folha (4.1.15.)  | 4.2 - Integration  | 🔴 Alta    |
| 19  | Dados segmentados por Consignante e Consignatária (4.1.16.)     | 4.3 - Segmentation | 🟡 Média   |

### GitHub Issues (from `plano.md`)

**Issue 4.1 - Migration: Importação de Legado**

- 4.1.1: Script parseador CSV legado → Prisma schema
- 4.1.2: Seed script migration com validação de integridade
- 4.1.3: Rollback mechanism para importação falha

**Issue 4.2 - Integration: Folha Mensal**

- 4.2.1: Endpoint POST /api/arquivos/import (recebe CSV folha MACAEPREV)
- 4.2.2: Parser de folha com byline tracking (desconto/repasse por linha)
- 4.2.3: Validações de arquivo (encoding, formato, checksums)
- 4.2.4: Endpoint GET /api/arquivos/export (gera CSV retorno)
- 4.2.5: Processamento de retorno com update de status

**Issue 4.3 - Segmentation: Relatórios por Segmento**

- 4.3.1: Queries de reconciliação agrupadas por consignante/consignatária
- 4.3.2: Endpoint GET /api/reconciliacao/relatorio (filtra por período)
- 4.3.3: Auditoria completa de movimentação de parcelas

---

## 🏗️ Arquitetura de Solução

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Folha MACAEPREV (CSV)                           │
│              (entrada: consignante, consignatária, parcelas)         │
└──────────────────────────┬──────────────────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │   POST /api/arquivos/import │ ◄── Backend Fastify
            │   (Upload + Validação)      │
            └──────────────┬──────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   Parser CSV      Validação          Byline Tracking
   (Schema map)    (Checksum,         (Desconto,
                    Encoding,         Repasse,
                    Formato)          Acréscimo)
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
            ┌─────────────────────────────┐
            │   Database (PostgreSQL)     │
            │   ├── Arquivos (metadados)  │
            │   ├── Parcelas (updates)    │
            │   ├── LogAuditoria (trails) │
            │   └── Repasse (cálculos)    │
            └─────────────────┬───────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │   GET /api/arquivos/export  │
            │   (Retorno processado)      │
            └─────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │   Relatório Reconciliação (CSV)  │
        │   (saída: status, reconciliado)  │
        └──────────────────────────────────┘
```

### Tabelas Impactadas (Prisma Schema)

**Novas Tabelas:**

- `Arquivo`: { id, nome, tipo(FOLHA/RETORNO/LEGADO), data_upload, data_processamento, consignante_id, checksum, status }
- `Repasse`: { id, parcela_id, arquivo_id, tipo(DESCONTO/ACRESCIMO/JUROS/RETENCAO), valor, percentual, data_movimento }

**Tabelas Modificadas:**

- `Parcela`: add campo `data_processamento_folha`, `status_reconciliacao`
- `LogAuditoria`: expandir para registrar movimentações de arquivo

---

## Documentos de Apoio

- [README do milestone](./README.md)
- [Plano de execução](./planejamento.md)
- [Especificação de testes](./testes.md)
- [Validação atual](./validacao.md)
- [Entrega parcial](./entrega.md)
- [Evidências](./evidencias.md)

---

## 📊 Formato CSV Esperado

### Entrada (Folha MACAEPREV)

```csv
consignante_id,consignataria_id,matricula_servidor,nome_servidor,produto_id,valor_liquido,desconto,taxa_efetiva,parcela_numero,data_vencimento
"001","B001","MAT001","João Silva","PROD001",5000.00,250.00,5.0,1,2026-02-15
"001","B001","MAT002","Maria Santos","PROD002",3500.00,175.00,5.0,1,2026-02-15
```

### Saída (Retorno Reconciliado)

```csv
arquivo_id,consignante_id,consignataria_id,parcela_id,status_processamento,valor_conciliado,observacoes,data_processamento
"ARQ001","001","B001","PARC001","CONCILIADA",250.00,"OK",2026-02-15
"ARQ001","001","B001","PARC002","PENDENTE",0.00,"Aguardando retorno",2026-02-15
```

---

## 🔐 Requisitos de Segurança

- ✅ Validação de checksums MD5/SHA256 de arquivo
- ✅ Encoding UTF-8 enforced com detecção de BOM
- ✅ Rate-limiting em endpoint de import (5 uploads/hora por usuário)
- ✅ Bloqueio de re-processamento de arquivo duplicado
- ✅ Auditoria completa de todas as operações (IP, usuário, timestamp)
- ✅ Permissão role: apenas ADMINISTRADOR pode fazer import
- ✅ Backup automático de arquivo antes de processing

---

## 🧪 Estratégia de Testes

**Cobertura Estimada:** 40+ testes

### Testes Unitários (15 testes)

- Parser CSV: validação de schema, handling de encoding, BOM detection
- Calculadora de repasse: desconto, acréscimo, juros
- Validador de arquivo: checksum, tamanho, linhas

### Testes de Integração (15 testes)

- Upload de arquivo + processamento
- Reconciliação de parcelas vs folha
- Rollback em caso de erro

### Testes E2E (10 testes)

- Upload arquivo via POST /api/arquivos/import
- Verificação de atualização de Parcelas
- Export de relatório via GET /api/arquivos/export

---

## 📈 Métricas de Sucesso

| Métrica                                      | Meta              | Status |
| -------------------------------------------- | ----------------- | ------ |
| Cobertura de Testes                          | ≥ 80%             | ✅     |
| Tempo de Processamento (arquivo 1000 linhas) | < 5s              | ✅     |
| Taxa de Reconciliação                        | ≥ 95%             | ✅     |
| Documentação                                 | 100% de endpoints | ✅     |
| Build TypeScript                             | Sem erros         | ✅     |

---

## 📚 Documentos Relacionados

- [Plano Detalhado](./planejamento.md) — Cronograma e tarefas
- [Especificação de Testes](./testes.md) — Casos de teste detalhados
- [Critérios de Validação](./validacao.md) — Acceptance criteria
- [Checklist de Entrega](./entrega.md) — Go-live requirements
- [Análise de Requisitos](./analise.md) — Quebra detalhada de requirements
