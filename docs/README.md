# 📋 Documentação — MACAEPREV

> **Sistema de Controle Operacional de Consignações com Desconto em Folha**  
> Instituto de Previdência Social do Município de Macaé — Rio de Janeiro, Brasil

**Status:** Milestones 1–5 Concluídas (83%+) | **Próximas:** M6 (Frontend UX), M7 (Suporte & Operação)

---

## 📖 Como Usar Esta Documentação

### 👨‍💻 Desenvolvedores

1. [manuais/desenvolvedor.md](manuais/desenvolvedor.md) — Setup local, boas práticas
2. [tecnico/especificacoes_tecnicas.md](tecnico/especificacoes_tecnicas.md) — Arquitetura e RN
3. [banco_de_dados/dicionario_dados.md](banco_de_dados/dicionario_dados.md) — Schema
4. [tecnico/SECURITY.md](tecnico/SECURITY.md) — Segurança & secrets
5. [manuais/deploy.md](manuais/deploy.md) — CI/CD, Docker, AWS

### 👔 Gestores/POs

1. [STATUS.md](STATUS.md) — Status consolidado
2. [poc/Poc_respondida.md](poc/Poc_respondida.md) — 30 POCs respondidas
3. [PLANO_IMPLEMENTACAO.md](PLANO_IMPLEMENTACAO.md) — Arquitetura, roadmap
4. [implementacao/ANALISE_COMPLETA_PROJETO.md](implementacao/ANALISE_COMPLETA_PROJETO.md) — Visão geral

### 🔧 Operadores

1. [manuais/operacoes_finais.md](manuais/operacoes_finais.md) — Runbook, escalação
2. [manuais/administrador.md](manuais/administrador.md) — Gestão de usuários, dados
3. [manuais/configuracao.md](manuais/configuracao.md) — Variáveis de ambiente
4. [manuais/deploy.md](manuais/deploy.md) — Deploy em produção

### 📚 Usuários Finais

1. [manuais/usuario.md](manuais/usuario.md) — Guia de uso do sistema

---

## 📁 Estrutura de Documentos

```
docs/
├── README.md                              # Este arquivo
├── STATUS.md                              # Status consolidado (atualizado)
├── PLANO_IMPLEMENTACAO.md                 # Arquitetura & decisões técnicas
│
├── manuais/                               # 📚 Operação & Uso
│   ├── desenvolvedor.md                   # Setup local, boas práticas, CI
│   ├── deploy.md                          # Infraestrutura AWS, Terraform
│   ├── usuario.md                         # Guia para usuários finais
│   ├── administrador.md                   # Gestão MACAEPREV
│   ├── configuracao.md                    # Variáveis de ambiente
│   └── operacoes_finais.md                # Runbook, escalação, SLA
│
├── tecnico/                               # 🔧 Documentação Técnica
│   ├── especificacoes_tecnicas.md         # Requisitos, RN, casos de uso
│   ├── estrutura_projeto.md               # Árvore de diretórios
│   ├── design_system.md                   # Componentes React
│   ├── login.md                           # Fluxo MFA/LGPD
│   ├── SECURITY.md                        # Segurança, LGPD, gestão de secrets
│   ├── OPENAPI.md                         # Como gerar OpenAPI
│   └── globals.css                        # Stylesheet global
│
├── banco_de_dados/                        # 🗄️ Modelo de Dados
│   ├── dicionario_dados.md                # 13 tabelas detalhadas
│   └── modelo_er.md                       # Diagrama ER, índices
│
├── licitacao/                             # 📜 Contrato & Especificação
│   ├── requisitos.md                      # Requisitos 4.1.x
│   ├── Poc_original.md                    # 30 questões originais
│   ├── agent.md                           # Escopo do agente
│   ├── planejamento.md                    # Planejamento da licitação
│   └── requisitos_status.md               # Status dos requisitos
│
├── poc/                                   # ✅ POCs Respondidas
│   └── Poc_respondida.md                  # 30 POCs com status real
│
├── implementacao/                         # 🚀 Análises & Planos
│   ├── ANALISE_COMPLETA_PROJETO.md        # Análise estratégica
│   ├── ANALISE_COMPLETA_SISTEMA.md        # Análise técnica
│   ├── ANALISE_GARGALOS.md                # Performance, escalabilidade
│   ├── ANALISE_FRONTEND_BUGS.md           # Bugs & fixes
│   └── TEST_REPORT.md                     # Relatório de testes
│
├── integracao/                            # 🔗 APIs & Integrações
│   ├── CURL_EXAMPLES.md                   # Exemplos HTTP
│   ├── openapi.json                       # Spec OpenAPI
│   └── MACAEPREV_API_Collection.postman_collection.json
│
├── infraestrutura/                        # ☁️ Deploy & Infra
│   └── VERCEL_ENV_VARS.md                 # Variáveis Vercel (dev)
│
├── milestones/                            # 📊 Entregas por Milestone
│   ├── M1_fundacao_infra/                 # POCs: 1, 15, 23, 29 ✅
│   ├── M2_seguranca/                      # POCs: 6, 12, 24, 28 ✅
│   ├── M3_core_consignacoes/              # POCs: 3–5, 7–11, 16, 20–21 ✅
│   ├── M4_integracao_folha/               # POCs: 2, 17–19 ✅
│   ├── M5_relatorios_bi/                  # POCs: 10, 14, 22, 30 ✅
│   ├── M6_frontend_ux/                    # POCs: 1, 13, 15 (⏳ Planejado)
│   └── M7_suporte_operacao/               # POCs: 25–27 (⏳ Planejado)
│       Cada pasta com: documentacao.md, testes.md, validacao.md, evidencias.md, entrega.md
│
├── projeto/                               # 📋 Planejamento
│   ├── plano.md                           # Roadmap, issues, dependências
│   └── template_entregaveis.md            # Template dos 5 documentos
│
└── figma-mcp/                             # 🎨 Design System (Figma)
    └── [docs MCP de integração Figma]
```

---

## ⚙️ Stack Tecnológico Definitivo

| Camada             | Tecnologia        | Versão LTS  |
| ------------------ | ----------------- | ----------- |
| **Runtime**        | Node.js           | 24.x        |
| **Linguagem**      | TypeScript        | 6.x         |
| **Backend**        | Fastify           | 5.8.5       |
| **Frontend**       | Next.js + React   | 15.1.0 + 19 |
| **ORM**            | Prisma            | 6.19.3      |
| **Banco de Dados** | PostgreSQL        | 13+ (RDS)   |
| **Autenticação**   | JWT + TOTP        | —           |
| **Deploy**         | AWS ECS (Fargate) | —           |
| **CDN**            | CloudFront        | —           |
| **CI/CD**          | GitHub Actions    | —           |

---

## 📊 Status de Progresso

| Milestone | Escopo                    | Status       | POCs  |
| --------- | ------------------------- | ------------ | ----- |
| **M1**    | Fundação & Infraestrutura | ✅ Completo  | 4/4   |
| **M2**    | Segurança & Autenticação  | ✅ Completo  | 4/4   |
| **M3**    | Núcleo de Consignações    | ✅ Completo  | 10/10 |
| **M4**    | Integração com Folha      | ✅ Completo  | 4/4   |
| **M5**    | Relatórios & BI           | ✅ Completo  | 4/4   |
| **M6**    | Frontend & UX             | ⏳ Planejado | 3/3   |
| **M7**    | Suporte & Operação        | ⏳ Planejado | 3/3   |

**Taxa de conclusão:** 25/30 POCs (83%+) | **Próximas:** M6, M7 para 100%

---

## 🔐 Segurança & LGPD

- Configuração: [tecnico/SECURITY.md](tecnico/SECURITY.md)
- Variáveis: [manuais/configuracao.md](manuais/configuracao.md)
- Especificações: [tecnico/especificacoes_tecnicas.md](tecnico/especificacoes_tecnicas.md)

---

## 📞 Contribuição & Suporte

1. **Edite documentação** em `docs/` e submeta PR
2. **Nunca commite credenciais** — use placeholders
3. **Atualize STATUS.md** ao completar milestones
4. **Consulte Poc_respondida.md** antes de implementar

---

**Última atualização:** 12 de maio de 2026
