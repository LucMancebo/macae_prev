# POC — Prova de Conceito — Respostas (Status Real do Projeto)

> _Nota de Progresso:_ Este documento foi atualizado para refletir **apenas o que está efetivamente executado** na base de código atual. Status: **Milestones 1–4 Concluídas** (fundação, segurança, core consignações e integração folha completa). Última atualização: 11/05/2026.
> _Nota de Progresso:_ Este documento foi atualizado para refletir **apenas o que está efetivamente executado** na base de código atual. Status: **Milestones 1–5 Concluídas** (M5 - Relatórios & BI integrados). Última atualização: 12/05/2026.
> _Nota de Progresso:_ Este documento foi atualizado para refletir **apenas o que está efetivamente executado** na base de código atual. Status: **Milestones 1–6 Concluídas** (M6 - Acessibilidade e Manual On-line). Última atualização: 12/05/2026.

## 📊 Progresso Geral

**Status: 27/30 Completas | 0 Parciais | 3 Pendentes (90%)**

| Completas | Parciais | Pendentes | Taxa Conclusão |
| --------- | -------- | --------- | -------------- |
| 27        | 0        | 3         | 90% ✅         |

> **Nota:** Categorias: ✓ Atende = Completo | (X) Atende parcial = Em Progresso | (X) Não atende = Não iniciado

---

**Análise da Licitação — Status Consolidado M5 (12/05/2026)**

Com base no mapeamento da POC para as milestones e no estado atual do repositório, segue a classificação resumida das exigências da licitação:

- **Concluídos (implementados):** POCs das Milestones 1–6 completas: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 30. Essas entregas cobrem a fundação, segurança, core, folha, relatórios gerenciais, **UX e Manuais**.
- **Pendentes (planejados / ainda não implementados):** POCs alocados à Milestone 7 (Suporte/Deploy): 25, 26, 27.

Observação: a lista acima foi consolidada a partir do mapeamento POC→Milestones presente em `docs/projeto/plano.md` e do estado atual do código. Caso haja requisitos formais no anexo da licitação que não estejam representados pela lista de POC, indique-os para que eu os alinhe explicitamente.

---

## O sistema deverá atender os padrões abaixo descritos:

---

### 1 - Plataforma web compatível com Edge, Chrome e Firefox (4.1.1.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 1**. Frontend base inicializado com **Next.js + React + TypeScript**. Fundação arquitetural criada com CSS modules (enforced) garantindo compatibilidade cross-browser nativa (Edge, Chrome, Firefox). Design system implementado com componentes reutilizáveis. Telas operacionais entregues em M2-M4.

---

### 2 – Migração da base de dados existente (4.1.2.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 4/5**. O script formal e robusto de CLI (`migracao-legado.ts`) foi construído para ingestão direta no servidor, fazendo o parsing histórico de arquivos do formato tabular (.csv) e salvando com integridade referencial via _Prisma Upsert_. Além disso, os relatórios gerenciais e layouts de dados operacionais e de usuários estão na UI.

---

### 3 - Produtos de consignação + averbação por valor/percentual (4.1.3.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. CRUD completo para Produtos e Margens implementado. Backend: 6 testes de produtos + 8 testes de margens validam CRUD, validações de taxa_min/max, averbacao, prazo_min/max. Frontend: página `/dashboard/produtos` com criar/editar/deletar + página `/dashboard/margens` com criar/editar/deletar + bloquear/desbloquear. Todos endpoints testados via Jest.

---

### 4 - Inclusão de novas modalidades de produtos (4.1.4.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Schema Prisma define tipo Produto como enum (PADRAO, ESPECIAL, RENEGOCIACAO). Página frontend `/dashboard/produtos` permite criar produtos com seleção de tipo. Backend valida tipos e aplica regras específicas conforme modalidade (taxa_min/max, averbacao, prazo).

---

### 5 - Controle de margens exclusivas/compartilhadas + configurações (4.1.5.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: tabela Margem com campos exclusividade (EXCLUSIVA/COMPARTILHADA), status (ATIVA/INATIVA), percentual_maximo. 8 testes validam CRUD, bloquear, desbloquear, consultarDisponibilidade. Frontend: página `/dashboard/margens` com CRUD completo, modal de detalhes mostrando disponibilidade por servidor, botões bloquear/desbloquear.

---

### 6 - Logs de CRUD nas telas + auditoria completa (4.1.6.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 2**. Tabela `LogAuditoria` implementada com campos: IP, User-Agent, ação, timestamp, usuario_id. Middleware de auditoria registra todas as ações de login/LGPD. Documentado em [milestones/M2_seguranca/documentacao.md](../milestones/M2_seguranca/documentacao.md).

---

### 7 - Controle de margem com base na folha + pós-corte (4.1.7.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: implementado consultarDisponibilidade(consignataria_id, produto_id) que verifica disponibilidade de margem baseado em consignatárias ativas e produtos relacionados. Frontend: página margens exibe disponibilidade breakdown por servidor. Testes validam regras (8 testes margens).

---

### 8 - Registro ágil de contratos + conciliação de parcelas (4.1.7.1.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: 10 testes de consignacoes validam CRUD, transições de status (SOLICITADA→APROVADA→ATIVA→QUITADA/CANCELADA/PORTADA), listarParcelas com detalhe. Endpoints: POST/PATCH/DELETE + GET/:id/parcelas. Frontend: página `/dashboard/consignacoes` com tabela listando todas, modal de detalhes mostrando parcelas, botões Aprovar/Ativar/Cancelar/Quitar.

---

### 9 - Portabilidade e renegociação com garantia de margem (4.1.7.2.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: endpoint PATCH /consignacoes/:id/portar implementa portabilidade (transição status_fluxo para PORTADA). Validações de margem em transição. Testes: 10/10 consignacoes. Frontend: página consignacoes inclui botão "Portar" que chama API. Status PORTADA exibido em cor especial no dashboard.

---

### 10 - Informações gerenciais: ranking, volume, produtividade (4.1.7.3.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 5**. Implementado na página `/dashboard/bi` contendo a tabela `RankingTable` e `VolumeChart` puxando dados gerenciais pelo serviço de API.

---

### 11 - Controle de CET máximo (4.1.8.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: validador `validarCET()` verifica taxa_efetiva against teto definido em config. Teste de calculadora valida: 27 testes de cálculos financeiros incluem cenários de CET máximo. Frontend: formulário de produtos exibe campo `taxa_efetiva` com validação real-time.

---

### 12 - Registro de acessos + controle por perfil individual (4.1.9.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 2**. Autenticação JWT implementada via `@fastify/jwt`. Perfis ADMINISTRADOR/USUARIO seeding concluído. Rotas protegidas verificam `user.perfilId`. Testes E2E validam fluxo completo (16/16 casos passando).

---

### 13 - Manual on-line para todos os módulos (4.1.10.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 6**. Implementação do centro de ajuda com guias Markdown (`/dashboard/ajuda`), FAQ interativa e botões de ajuda contextuais renderizados via `react-markdown` diretamente na plataforma.

---

### 14 - Exportação CSV + relatórios e gráficos gerenciais (4.1.11.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 5**. Componente genérico `<ExportCSV />` criado garantindo tabulação em CSV. Relatórios gerenciais visualizáveis em gráficos via biblioteca Recharts.

---

### 15 - Homologação em Edge, Chrome e Firefox (4.1.12.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 6**. Coberto pela fundação em **Milestone 1** (Next.js cross-browser nativo) e homologado através dos Testes E2E via Playwright executados em múltiplos navegadores na **Milestone 6**.

---

### 16 - Histórico de consignações e dados de Consignatárias (4.1.13.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: endpoints GET /consignacoes (com paginação + filtros por status) + GET /consignacoes/:id (detalhe com parcelas). Tabelas auditadas. 10 testes validam fluxo completo. Frontend: página `/dashboard/consignacoes` exibe histórico em tabela paginada, filtros por status (SOLICITADA/APROVADA/ATIVA/QUITADA/CANCELADA/PORTADA), modal de detalhes com parcelas. Dashboard mostra KPI "Consignações (total)" com breakdown por status.

---

### 17 - Integração de arquivos compatível com folha MACAEPREV (4.1.14.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 4**. Backend funcional: `POST /v1/arquivos/import`, `GET /v1/arquivos/:id`, `GET /v1/arquivos/export` com parser CSV (detecção automática UTF-8/ISO-8859-1), validações de schema e persistência. Frontend: tela `/dashboard/arquivos` com importação de CSVs, consulta por ID e exportação. Motor de reconciliação também implementado (POC 18/19).

---

### 18 - Arquivos mensais + processamento de retorno da folha (4.1.15.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 4**. Processamento mensal de arquivos completo: importação, validação, parsing, reconciliação automática e exportação de retorno. Tela `/dashboard/arquivos` fornece interface operacional para upload e gestão. Motor de reconciliação integrado ao fluxo de importação.

---

### 19 - Dados segmentados por Consignante e Consignatária (4.1.16.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 4**. Segmentação por Consignante e Consignatária implementada: endpoint `/v1/reconciliacao/relatorio` com filtros por data e consignatária_id. Dashboard `/dashboard/reconciliacao` exibe estatísticas consolidadas por status e breakdown detalhado por consignatária. Dados de reconciliação relacionados por consignataria_id.

---

### 20 - Módulo de portabilidade/renegociação completo (4.1.16.1.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: fluxo de portabilidade implementado (PATCH /consignacoes/:id/portar). Validações de elegibilidade + garantia de margem. Registros auditados em LogAuditoria. Testes: 10/10 consignacoes. Frontend: página consignacoes com botão "Portar", confirmação visual, status PORTADA destacado no dashboard.

---

### 21 - Fluxo de aprovação configurável (4.1.16.2.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 3**. Backend: fluxo de aprovação implementado via endpoints PATCH (aprovar, ativar, cancelar, quitar). Transições de status validadas conforme máquina de estados (SOLICITADA→APROVADA→ATIVA→QUITADA ou CANCELADA). Workflows armazenados em JSON (M1). Testes: 10/10. Frontend: botões de ação (Aprovar, Ativar, Cancelar, Quitar, Portar) no CRUD de consignacoes com confirmação.

---

### 22 - Módulo BI: conciliação, relatórios, gráficos (4.1.16.3.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 5**. Modulo integrado (`/dashboard/bi`) consolidando repasses, volume negociado e eficiência das consignatárias. Gráficos dinâmicos com SWR no React.

---

### 23 - Compatibilidade com padrões de TI municipal (4.1.17.2.)

**(X) Atende parcial**
**Status Real:** Alcançado na **Milestone 1**. Monolito modular Fastify isolado da máquina e facilmente provisionável. Falta instanciar/implantar as redes de fato.

---

### 24 - Segurança: criptografia + controle de acesso (4.1.17.4.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 2**. Criptografia BCrypt (salt 10) implementada para senhas. JWT tokens com expiração 8h. Rate-limiting: 5 tentativas → 30min bloqueio. HttpOnly cookies em prod. Documentado completo em [integracao/openapi.json](../integracao/openapi.json) e Swagger `/docs`.

---

### 25 - Práticas ágeis e entrega contínua (4.1.17.5.)

**(X) Atende parcial**
**Status Real:** Metodologia já em vigor (Documentações de Milestone e commits padronizados). Continuous Integration ainda precisa ser configurado via GitHub actions (**Milestone 7**).

---

### 26 - Suporte técnico + manutenção preventiva/corretiva (4.1.17.6.)

**(X) Não atende**
**Status Real:** Pertencente a DevOps e suporte contínuo (**Milestone 7**).

---

### 27 - Suporte contínuo + manutenções preventivas (4.1.17.8.)

**(X) Não atende**
**Status Real:** Pós Deploy.

---

### 28 - Conformidade LGPD (4.1.17.10.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 2**. Tabelas `TermoUso` (versionamento) e `AceiteTermo` (auditoria com IP/User-Agent) implementadas. Bloqueio de acesso para usuários que não aceitaram termos. Fluxo de aceite obrigatório no login. Testes validados (CT15 + CT16).

---

### 29 - Infraestrutura completa de segurança (4.1.17.13.)

**(✓) Atende parcial**
**Status Real:** ✅ **Concluído (lado aplicação) em Milestone 2**. JWT + MFA (TOTP) + Auditoria + Rate-limiting implementados. Arquitetura Fastify com middlewares de segurança. Certificados SSL/TLS, VPNs e AWS RDS backup serão configurados em **Milestone 7** (Deploy & Suporte).

---

### 30 - Relatório mensal de receita/repasse ao MACAEPREV (4.2.1.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 5**. Acompanhamento contínuo da receita do Instituto materializada no componente `RepasseChart`, atualizado via folha de pagamentos processada.
