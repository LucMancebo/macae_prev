# POC — Prova de Conceito — Respostas (Status Real do Projeto)

> _Nota de Progresso:_ Este documento foi atualizado para refletir **apenas o que está efetivamente executado** na base de código atual. Status: **Milestones 1 & 2 Concluídas** (Fundação & Segurança). Última atualização: 10/05/2026.

## O sistema deverá atender os padrões abaixo descritos:

---

### 1 - Plataforma web compatível com Edge, Chrome e Firefox (4.1.1.)

**(X) Atende**
**Status Real:** O projeto frontend base foi inicializado (Milestone 1) utilizando **Next.js + React + TypeScript**. A fundação arquitetural foi criada assegurando a acessibilidade cross-browser nativa que o framework web garante. A regra rígida de CSS externo/modules foi adicionada às memórias e enforced. Telas visuais entrarão na estimativa da M6.

---

### 2 – Migração da base de dados existente (4.1.2.)

**(X) Não atende**
**Status Real:** Planejado construtivamente para a **Milestone 4**. Os schemas de importação de banco já estão desenhados, mas os scripts de parsing/migração ainda não foram codificados.

---

### 3 - Produtos de consignação + averbação por valor/percentual (4.1.3.)

**(X) Não atende** (Etapa avançada em modelagem)
**Status Real:** Modelagem das tabelas `produtos` e `margens` criadas no BD via Prisma na M1, mas a funcionalidade de software e visualização (Frontend/API) será feita na **Milestone 3**.

---

### 4 - Inclusão de novas modalidades de produtos (4.1.4.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**. A modelagem possui tipos configuráveis em `schema.prisma`, mas sem interface de administração ainda.

---

### 5 - Controle de margens exclusivas/compartilhadas + configurações (4.1.5.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**. Entidades abstratas mapeadas (M1), motor de regras pendente.

---

### 6 - Logs de CRUD nas telas + auditoria completa (4.1.6.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 2**. Tabela `LogAuditoria` implementada com campos: IP, User-Agent, ação, timestamp, usuario_id. Middleware de auditoria registra todas as ações de login/LGPD. Documentado em `docs/milestones/M2_seguranca/documentacao.md`.

---

### 7 - Controle de margem com base na folha + pós-corte (4.1.7.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**.

---

### 8 - Registro ágil de contratos + conciliação de parcelas (4.1.7.1.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**. Tabela de `contratos` e `parcelas` geradas (M1). Conciliador (Motor) não iniciado.

---

### 9 - Portabilidade e renegociação com garantia de margem (4.1.7.2.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**.

---

### 10 - Informações gerenciais: ranking, volume, produtividade (4.1.7.3.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 5**.

---

### 11 - Controle de CET máximo (4.1.8.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**.

---

### 12 - Registro de acessos + controle por perfil individual (4.1.9.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 2**. Autenticação JWT implementada via `@fastify/jwt`. Perfis ADMINISTRADOR/USUARIO seeding concluído. Rotas protegidas verificam `user.perfilId`. Testes E2E validam fluxo completo (16/16 casos passando).

---

### 13 - Manual on-line para todos os módulos (4.1.10.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 6**.

---

### 14 - Exportação CSV + relatórios e gráficos gerenciais (4.1.11.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 5**.

---

### 15 - Homologação em Edge, Chrome e Firefox (4.1.12.)

**(X) Atende parcial**
**Status Real:** Coberto parcialmente pela **Milestone 1** (Setup UI via JS frameworks homologados cross-browser nativo). Finalizaremos evidências de interface final (Testes E2E e CI/CD) apenas na **M6**.

---

### 16 - Histórico de consignações e dados de Consignatárias (4.1.13.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3 / 5**.

---

### 17 - Integração de arquivos compatível com folha MACAEPREV (4.1.14.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 4**. Tabela auxiliar `arquivos_integracao` finalizada na M1.

---

### 18 - Arquivos mensais + processamento de retorno da folha (4.1.15.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 4**.

---

### 19 - Dados segmentados por Consignante e Consignatária (4.1.16.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 4** e alocados os controles de view (Milestone 2).

---

### 20 - Módulo de portabilidade/renegociação completo (4.1.16.1.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**.

---

### 21 - Fluxo de aprovação configurável (4.1.16.2.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 3**. Tabela de workflow já instanciada dinamicamente via JSON na M1.

---

### 22 - Módulo BI: conciliação, relatórios, gráficos (4.1.16.3.)

**(X) Não atende**
**Status Real:** Planejado para **Milestone 5**.

---

### 23 - Compatibilidade com padrões de TI municipal (4.1.17.2.)

**(X) Atende parcial**
**Status Real:** Alcançado na **Milestone 1**. Monolito modular Fastify isolado da máquina e facilmente provisionável. Falta instanciar/implantar as redes de fato.

---

### 24 - Segurança: criptografia + controle de acesso (4.1.17.4.)

**(✓) Atende**
**Status Real:** ✅ **Concluído em Milestone 2**. Criptografia BCrypt (salt 10) implementada para senhas. JWT tokens com expiração 8h. Rate-limiting: 5 tentativas → 30min bloqueio. HttpOnly cookies em prod. Documentado completo em `docs/openapi.json` e Swagger `/docs`.

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

**(X) Não atende**
**Status Real:** Planejado para **Milestone 5**.
