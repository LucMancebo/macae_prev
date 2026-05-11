# M4: Plano de Execução & Cronograma

**Duração Total:** 4 semanas | **56 horas** | **Em progresso**

---

## 📅 Cronograma por Semana

### Semana 1: Migration & CSV Parser (14 horas)

**Objetivo:** Implementar parseador de CSV legado e scripts de migração

**Status Atual:** o backend M4 e o frontend de arquivos já estão implementados. Parser CSV, validações, service de arquivos, rotas, schema/migration Prisma, service frontend e página `/dashboard/arquivos` foram entregues e validados com `npm run test:local-db` + checagem de tipagem no web. Permanecem pendentes a engine de reconciliação, relatórios segmentados e a documentação de API final.

#### Terça (7h)

- [ ] **Task 1.1** (3h): Análise de formato CSV MACAEPREV legado
  - Extrair especificação exata de campos, encoding, delimitadores
  - Documentar mapeamento MACAEPREV → Prisma schema
  - Arquivo: `docs/milestones/M4_integracao_folha/csv_spec.md`

- [ ] **Task 1.2** (2h): Criar estrutura de utils/parser
  - Backend: `api/src/utils/csv-parser.ts` (parseCSV, validateSchema)
  - Backend: `api/src/utils/validators/arquivo.ts` (checksum, encoding, formato)
  - Tests: `api/__tests__/csv-parser.test.ts`

- [ ] **Task 1.3** (2h): Implementar tipos TypeScript
  - `api/src/types/arquivo.d.ts` (Arquivo, Repasse, ParseResult)
  - Align com Prisma schema existente

#### Quarta (4h)

- [ ] **Task 1.4** (3h): Parser CSV com validações
  - Função parseCSV(buffer, schema) → ParseResult
  - Encoding detection (UTF-8/ISO-8859-1/CP-1252)
  - BOM handling
  - Delimiter auto-detection (CSV/TSV/PIPE)
  - Testes: 5+ casos de validação

- [ ] **Task 1.5** (1h): Checksum utilities
  - MD5 + SHA256 para validação de duplicação de arquivo

#### Quinta (3h)

- [ ] **Task 1.6** (2h): Migration script (legacy DB → CSV)
  - Script TypeScript que lê banco legado e exporta CSV padronizado
  - Validação de integridade (sem linhas órfãs)

- [ ] **Task 1.7** (1h): Rollback mechanism
  - Função para desfazer importação falha (cascade delete)

**Entregáveis da Semana 1:**

- ✅ csv-parser.ts (parseCSV + validators)
- ✅ arquivo.d.ts / arquivo.ts (tipos e schema)
- ✅ 5+ testes de parser
- ✅ csv_spec.md documentado

---

### Semana 2: Integration Endpoints (14 horas)

**Objetivo:** Implementar endpoints de upload/processamento de folha

#### Terça (5h)

- [ ] **Task 2.1** (2h): Criar schema Prisma updates
  - Tabelas `Arquivo` e `Repasse` (se não existirem)
  - Campos em `Parcela`: data_processamento_folha, status_reconciliacao
  - Migration Prisma: `api/prisma/migrations/M4_arquivo_repasse.sql`

- [ ] **Task 2.2** (3h): Implementar service `ArquivoService`
  - Métodos: criarArquivo, validarArquivo, processarArquivo, exportarRetorno
  - Arquivo: `api/src/modules/arquivos/services/arquivo.service.ts`
  - Testes: `api/__tests__/arquivo.service.test.ts`

#### Quarta (5h)

- [ ] **Task 2.3** (4h): POST /api/arquivos/import endpoint
  - Fastify route: POST /arquivos/import
  - Multipart form data (file upload)
  - Validações: tamanho (max 10MB), checksum, encoding
  - Transação DB: insert Arquivo + update Parcelas + log auditoria
  - Rate-limiting: 5 uploads/hora por user
  - Response: { arquivo_id, linhas_processadas, erros[] }
  - Testes E2E: 3+ cases (sucesso, arquivo duplicado, erro parsing)

- [ ] **Task 2.4** (1h): GET /api/arquivos/:id endpoint
  - Retorna metadados de arquivo + linhas processadas
  - Filtrar por usuário (segurança)

#### Quinta (4h)

- [ ] **Task 2.5** (3h): GET /api/arquivos/export endpoint
  - Gera CSV de retorno com status de reconciliação
  - Filtro por período (data_inicio, data_fim)
  - Agrupamento por consignante/consignatária
  - Arquivo: CSV com colunas: arquivo_id, consignante_id, parcela_id, status, valor_conciliado

- [ ] **Task 2.6** (1h): Byline Tracking
  - Registro de Repasse por linha (desconto, acréscimo, juros)
  - Cálculo de saldo por parcela

**Entregáveis da Semana 2:**

- ✅ Tabelas Arquivo + Repasse criadas
- ✅ ArquivoService completo
- ✅ POST /api/arquivos/import (implementado e validado)
- ✅ GET /api/arquivos/:id e GET /api/arquivos/export implementados
- ✅ 8+ testes de integração/validação no backend

---

### Semana 3: Reconciliation & Frontend (14 horas)

**Objetivo:** Implementar motor de reconciliação e UI de gerenciamento

#### Terça (5h)

- [ ] **Task 3.1** (3h): Reconciliation Engine
  - Arquivo: `api/src/utils/reconciliacao.ts`
  - Função reconciliarParcelas(arquivo_id) → ReconciliaoResult
  - Lógica: match linha arquivo ↔ Parcela (by consignante_id + matricula + valor)
  - Marcação: status_reconciliacao = CONCILIADA / PENDENTE / ERRO
  - Testes: 6+ cases (match perfeito, parcela órfã, valor divergente)

- [ ] **Task 3.2** (2h): GET /api/reconciliacao/relatorio endpoint
  - Query: period(data_inicio, data_fim), consignante_id, consignataria_id, status
  - Response: agrupamento por consignante/consignatária + contadores
  - Auditoria em LogAuditoria

#### Quarta (5h)

- [x] **Task 3.3** (4h): Frontend page `/dashboard/arquivos`
  - Tabela: arquivo_id, data_upload, consignante, linhas, status_processamento
  - Botões: Upload, Export, Ver Detalhes, Deletar
  - Modal detalhes: list de linhas processadas (com status por linha)
  - Upload form: drag-drop de arquivo CSV
  - Arquivo: `web/src/app/dashboard/arquivos/page.tsx` (350+ linhas)
  - CSS: `web/src/app/dashboard/arquivos/arquivos.module.css`

- [x] **Task 3.4** (1h): Frontend service
  - `web/src/services/arquivos.ts` (uploadArquivo, listarArquivos, exportarRetorno)

#### Quinta (4h)

- [ ] **Task 3.5** (2h): Frontend page `/dashboard/reconciliacao`
  - Relatório de reconciliação com filtros (período, consignante, consignatária)
  - Tabela: consignante, consignatária, total_parcelas, conciliadas, pendentes, taxa_reconciliacao
  - Gráfico: status breakdown (donut)
  - Arquivo: `web/src/app/dashboard/reconciliacao/page.tsx` (280+ linhas)

- [ ] **Task 3.6** (2h): Atualizar dashboard com KPIs M4
  - KPI: "Arquivos Processados (últimos 30d)" com status breakdown
  - KPI: "Taxa de Reconciliação" (% conciliadas)
  - Integração em `web/src/app/dashboard/page.tsx`

**Entregáveis da Semana 3:**

- ⏳ reconciliacao.ts (engine)
- ⏳ GET /api/reconciliacao/relatorio
- ✅ Página `/dashboard/arquivos`
- ⏳ Página `/dashboard/reconciliacao` (relatório)
- ⏳ Dashboard KPIs atualizados
- ⏳ 10+ testes E2E

---

### Semana 4: Testing, Docs & Deployment (14 horas)

**Objetivo:** Validação completa, documentação, go-live

#### Terça (4h)

- [ ] **Task 4.1** (3h): Testes E2E completos
  - Cenário 1: Upload arquivo válido → 10 linhas conciliadas ✅
  - Cenário 2: Upload arquivo duplicado → erro 409
  - Cenário 3: Upload com encoding incorreto → erro 400
  - Cenário 4: Export relatório → CSV válido
  - Cenário 5: Rollback importação → cleanup de dados
  - Execução: `npm test` no /api (40+ testes M4)

- [ ] **Task 4.2** (1h): Performance test
  - Upload arquivo 5000 linhas → tempo < 10s
  - Reconciliação 1000 parcelas → tempo < 3s

#### Quarta (5h)

- [ ] **Task 4.3** (3h): Documentação API
  - Atualizar `docs/openapi.json` com 3 new paths:
    - POST /arquivos/import
    - GET /arquivos/:id
    - GET /arquivos/export
    - GET /reconciliacao/relatorio
  - Swagger UI atualizado em `/docs`

- [ ] **Task 4.4** (2h): README de M4
  - Como fazer upload de arquivo
  - Formato CSV esperado
  - Troubleshooting de erros comuns

#### Quinta (5h)

- [ ] **Task 4.5** (2h): Build & Type Safety
  - `npm run build` no /api → sem erros TS
  - `npm run build` no /web → sem erros TS
  - ESLint + Prettier

- [ ] **Task 4.6** (1h): Entrega de evidências
  - Arquivo: `evidencias.md` com screenshots + git commits
  - Arquivo: `validacao.md` com acceptance criteria ✅

- [ ] **Task 4.7** (2h): Merge & Deploy
  - Git merge M4 → main
  - Deploy preview em Vercel
  - Teste em staging

**Entregáveis da Semana 4:**

- ✅ 40+ testes passando no backend (Jest via runner local)
- ✅ Build TypeScript do backend sem erros
- ⏳ Build do frontend e ESLint/Prettier ainda pendentes
- ✅ README M4, evidências e validação atual já documentados
- ⏳ API docs finais e merge para main após frontend/M4 final

---

## 🎯 Marcos Intermediários

| Marco | Semana | Deliverable                   | Critério de Sucesso         |
| ----- | ------ | ----------------------------- | --------------------------- |
| M4.1  | 1      | CSV Parser + Types            | 5+ testes passando          |
| M4.2  | 2      | API Endpoints (import/export) | E2E upload funcionando      |
| M4.3  | 3      | Reconciliation + Frontend     | 2 páginas + KPIs            |
| M4.4  | 4      | Docs + Testing + Merge        | Build verde + Vercel deploy |

---

## ⚠️ Riscos & Mitigações

| Risco                                   | Probabilidade | Impacto | Mitigação                                        |
| --------------------------------------- | ------------- | ------- | ------------------------------------------------ |
| Formato CSV legado não documentado      | Alta          | Alto    | Extrair spec na Task 1.1 + contato com MACAEPREV |
| Performance de parser em arquivo grande | Média         | Médio   | Stream-based parsing + load tests                |
| Duplicação de arquivo não detectada     | Baixa         | Alto    | Checksum MD5+SHA256 obrigatório                  |
| Encoding UTF-8 com BOM causar erro      | Média         | Médio   | BOM detection automático em parser               |

---

## 🔄 Dependências Externas

- ✅ M3 completo (Core Consignações - schema de Parcela)
- ✅ Documentação CSV MACAEPREV (from Licitação)
- ✅ Banco legado (para extract de dados via migration script)

---

## 📊 Resource Planning

| Recurso                           | Horas  | % do Total |
| --------------------------------- | ------ | ---------- |
| Backend (API + Parser)            | 28     | 50%        |
| Frontend (Pages + Services)       | 14     | 25%        |
| Testes (Unit + Integration + E2E) | 10     | 18%        |
| Documentação                      | 4      | 7%         |
| **Total**                         | **56** | **100%**   |

---

## ✅ Definition of Done

- [ ] 40+ testes Jest com cobertura ≥ 80%
- [ ] TypeScript strict sem erros
- [ ] Todos endpoints documentados em OpenAPI
- [ ] 2 frontend pages (arquivos + reconciliacao)
- [ ] Dashboard KPIs atualizados
- [ ] Git commits semânticos (feat/fix/docs/test)
- [ ] Build verde em Vercel
- [ ] evidencias.md com screenshots e commits
- [ ] validacao.md com acceptance criteria ✅
- [ ] README atualizado
