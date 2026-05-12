# ROADMAP DE EXECUÇÃO: MACAEPREV - STATUS ATUALIZADO

## Milestone 1: Fundação & Infraestrutura [CONCLUÍDO]

- **Issue 1.1:** Setup da Arquitetura (API Fastify + Frontend Next.js) - [OK]
- **Issue 1.2:** Modelagem do Banco (Prisma ORM + 12 Entidades) - [OK]
- **Issue 1.3:** Dockerização (PostgreSQL local) - [OK]

## Milestone 2: Segurança, Autenticação e UX [EM ANDAMENTO - 90%]

### Issue 2.1: Ajustes de Interface (UX Premium)

- **Tarefa 2.1.1:** Refatoração visual (Glassmorphism). [CONCLUÍDO]
- **Tarefa 2.1.2:** Hotfix de Navegação (Sidebar fixa). [CONCLUÍDO - Ajuste Manual]

### Issue 2.2: Motor de Segurança & Auditoria

- **Tarefa 2.2.1:** Middleware JWT e Auditoria de CRUD. [CONCLUÍDO]
- **Tarefa 2.2.2:** Componente UI de Histórico (AuditModal). [CONCLUÍDO]
- **Tarefa 2.2.3:** Fluxo LGPD e MFA Integrado. [CONCLUÍDO]

### Issue 2.3: Homologação (Vercel) [NOVA]

- **Tarefa 2.3.1:** Configurar `vercel.json` para Monorepo. [CONCLUÍDO]
- **Tarefa 2.3.2:** Deploy e vinculação de variáveis de ambiente. [CONCLUÍDO]
- **Tarefa 2.3.2:** Vincular banco Neon e realizar Deploy. [EM ANDAMENTO]

## Milestone 3: Core - Gestão de Consignações [CONCLUÍDO]

- **Tarefa 3.1:** API e UI para Criação e Gestão de Produtos/Margens. [CONCLUÍDO]
- **Tarefa 3.2:** Motor de Cálculo de Margem e Portabilidade. [CONCLUÍDO]
- **Tarefa 3.3:** Workflows de aprovação de Consignação (Tabela/Detalhes). [CONCLUÍDO]

## Milestone 4: Integração com a Folha de Pagamento [CONCLUÍDO]

- **Tarefa 4.1:** Importação/Exportação e Parsing de CSV da Folha. [CONCLUÍDO]
- **Tarefa 4.2:** Reconciliação e Conciliação automática. [CONCLUÍDO]
- **Tarefa 4.3:** Dashboards de Erros (FK, Valor) e segmentação por Consignatária. [CONCLUÍDO]

## Milestone 5: Relatórios Analíticos & BI [CONCLUÍDO]

- **Tarefa 5.1:** Módulo de agregação no Backend (Volume, Ranking e Repasse). [CONCLUÍDO]
- **Tarefa 5.2:** Exportadores CSV (Contratos). [CONCLUÍDO]
- **Tarefa 5.3:** Dashboards Analíticos Frontend (Recharts). [CONCLUÍDO]
  - **Sub-tarefa 5.3.1:** Criação da estrutura base da tela de BI e gráficos. [CONCLUÍDO]
  - **Sub-tarefa 5.3.2:** Integração com SWR e API `/v1/relatorios`. [CONCLUÍDO]

## Milestone 6: Frontend & UX (Refinamentos & Manual) [CONCLUÍDO]

- **Tarefa 6.1:** Correções Críticas de Fluxo. [CONCLUÍDO]
  - Buscar Global ("busca rápida") funcional. [OK]
  - Implementar Edição (Update) e Inativação (Soft Delete) nos CRUDs. [OK]
  - Integrar Dashboard Overview com a API via SWR. [OK]
  - Revisar Perfis e Criação de Usuários. [OK]
- **Tarefa 6.2:** Manual On-line (POC 13). [CONCLUÍDO]

---

1- Preciso que entenda e eslareça os requisitos do arquivo requisitos.md.

- Relacione os requisitos com o necessario pra completar as questões da prova de conceito (POC).
- Responda todas as questões da prova de conceito (POC) com base nos requisitos do arquivo requisitos.md.
- Mostre como os requisitos do arquivo requisitos.md se aplicam a cada questão da prova de conceito (POC).
- Faça um resumo dos requisitos do arquivo requisitos.md.

  1.1- Elabore as etapas do projeto em Milestones, issues e subissues.

- Elabore um documento com as etapas do projeto em Milestones, issues e subissues.
- Liste e descreva cada etapa, issue e subissue.
- Liste e descreva as tarefas que precisam ser realizadas em cada issue e subissue.
- Liste e descreva as dependências entre as issues e subissues.
- Liste e descreva as dependências entre as issues e subissues.

2- Preciso que elabore um documento com as especificações tecnicas do projeto, com as seguintes informações:

- Descreva um cenário real de utilização do sistema
- Defina as entidades do sistema
- Defina os atributos das entidades
- Defina os relacionamentos entre as entidades
- Defina os casos de uso do sistema
- Defina as regras de negócio do sistema
- Defina os requisitos não funcionais do sistema
- Defina os requisitos de interface do sistema
- Defina os requisitos de integração do sistema
- Defina os requisitos de segurança do sistema
- Defina os requisitos de performance do sistema
- Defina os requisitos de disponibilidade do sistema
- Defina os requisitos de manutenibilidade do sistema
- Defina os requisitos de usabilidade do sistema
- Defina os requisitos de acessibilidade do sistema

3- Elabore o banco de dados do projeto.
4- Elabore o dicionário de dados do projeto.
5- Elabore o modelo entidade-relacionamento do pr
