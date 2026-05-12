# Documentação do Projeto

Arquivos de referência principais:

- **Técnico / Arquitetura**: `docs/tecnico/`
- **Fluxo de Login**: `docs/tecnico/login.md`
- **Variáveis para Vercel**: `VERCEL_ENV_VARS.md`
- **Segurança / Segredos**: `docs/SECURITY.md`

Como contribuir com a documentação

1. Edite ou crie arquivos dentro de `docs/`.
2. Nunca inclua credenciais reais em arquivos de documentação. Use placeholders.
3. Para exemplos de `.env` use os arquivos `*.example` existentes.

# 📋 Documentação — Sistema de Consignação MACAEPREV

> **Sistema de controle operacional e gerencial das operações de consignação com desconto em folha de pagamento**
>
> Instituto de Previdência Social do Município de Macaé (MACAEPREV) — Rio de Janeiro, Brasil

---

## 🎯 Status Geral do Projeto

| Milestone | Escopo                    | Backend      | Frontend     | Testes  | POCs  |
| --------- | ------------------------- | ------------ | ------------ | ------- | ----- |
| **M1**    | Fundação & Infraestrutura | ✅ Completo  | ✅ Completo  | Ok      | 4/4   |
| **M2**    | Segurança & Autenticação  | ✅ Completo  | ✅ Completo  | 16/16   | 4/4   |
| **M3**    | Núcleo de Consignações    | ✅ Completo  | ✅ Completo  | 118/118 | 10/10 |
| **M4**    | Integração com Folha      | ✅ Completo  | ✅ Completo  | —       | 4/4   |
| **M5**    | BI & Dashboards           | ⏳ Planejado | ⏳ Planejado | —       | —     |
| **M6**    | Frontend & UX             | ⏳ Planejado | ⏳ Planejado | —       | —     |
| **M7**    | Suporte & Operação        | ⏳ Planejado | ⏳ Planejado | —       | —     |

**Status Consolidado (M1 a M4)**: ✅ Monolito integrado e interfaces consumindo endpoints de negócio, englobando controle de margem, reconciliação de CSV e workflow de portabilidade.

---

## 📁 Estrutura de Documentos

```
docs/
├── licitacao/                    # Documentos originais da licitação
│   ├── agent.md                  # Escopo de trabalho do agente
│   ├── requisitos.md             # Requisitos da contratação (4.1.x)
│   └── Poc_original.md           # Prova de Conceito — questões originais
│
├── poc/                          # Prova de Conceito — Respostas
│   └── Poc_respondida.md         # 30 questões respondidas com justificativa técnica
│
├── tecnico/                      # Documentação técnica
│   ├── especificacoes_tecnicas.md  # Cenário de uso, entidades, casos de uso, regras de negócio
│   └── estrutura_projeto.md        # Estrutura de diretórios do código-fonte
│
├── banco_de_dados/               # Modelagem de dados
│   ├── dicionario_dados.md       # 12 tabelas detalhadas (campos, tipos, PKs, FKs)
│   └── modelo_er.md              # Diagrama ER + cardinalidades + índices
│
├── projeto/                      # Planejamento do projeto
│   ├── plano.md                  # Milestones, issues, sub-issues, dependências
│   └── template_entregaveis.md   # Templates dos 5 documentos por milestone
│
└── milestones/                   # Entregáveis por milestone (preenchidos após execução)
    ├── M1_fundacao_infra/        # POC: 1, 15, 23, 29
    ├── M2_seguranca/             # POC: 6, 12, 24, 28
    ├── M3_core_consignacoes/     # POC: 3, 4, 5, 7, 8, 9, 11, 16, 20, 21
    ├── M4_integracao_folha/      # POC: 2, 17, 18, 19
    ├── M5_relatorios_bi/         # POC: 10, 14, 22, 30
    ├── M6_frontend_ux/           # POC: 1, 13, 15
    └── M7_suporte_operacao/      # POC: 25, 26, 27
        Cada pasta conterá:
        ├── documentacao.md
        ├── testes.md
        ├── validacao.md
        ├── evidencias.md
        └── entrega.md
```

---

## ⚙️ Stack Tecnológico

| Camada           | Tecnologia                           |
| ---------------- | ------------------------------------ |
| Backend          | Node.js — API REST                   |
| Frontend         | React + TypeScript + Next.js         |
| Estilização      | CSS externo (`.css` / `.module.css`) |
| Banco de Dados   | PostgreSQL                           |
| ORM              | Prisma                               |
| Hospedagem       | AWS (EC2/ECS, RDS, S3, CloudFront)   |
| CI/CD            | GitHub Actions                       |
| Integração Folha | CSV (formato fixo)                   |

---

## 🗺️ Roadmap de Milestones

| #   | Milestone                       | Duração | POC Cobertas                     |
| --- | ------------------------------- | ------- | -------------------------------- |
| M1  | ✅ Fundação & Infraestrutura    | 4 sem   | 1, 15, 23, 29                    |
| M2  | ✅ Segurança & Autenticação     | 3 sem   | 6, 12, 24, 28                    |
| M3  | ✅ Core: Gestão de Consignações | 6 sem   | 3, 4, 5, 7, 8, 9, 11, 16, 20, 21 |
| M4  | ✅ Integração com Folha         | 4 sem   | 2, 17, 18, 19                    |
| M5  | ⏳ Relatórios & BI              | 3 sem   | 10, 14, 22, 30                   |
| M6  | ⏳ Frontend & UX                | 4 sem   | 1, 13, 15                        |
| M7  | ⏳ Suporte & Operação           | 2 sem   | 25, 26, 27                       |

---

## 📌 Processo de Validação

Cada milestone só avança após aprovação de **5 documentos obrigatórios**:

```
Implementação → Testes → Documentação → Evidências → Validação → ✅ Aprovação → Próxima Milestone
```

**✅ M3 Completo** (Implementação, Testes, Documentação, Evidências, Validação):

- Arquivo: [M3_core_consignacoes/documentacao.md](milestones/M3_core_consignacoes/documentacao.md)
- Testes: [M3_core_consignacoes/testes.md](milestones/M3_core_consignacoes/testes.md)
- Validação: [M3_core_consignacoes/validacao.md](milestones/M3_core_consignacoes/validacao.md)
- Evidências: [M3_core_consignacoes/evidencias.md](milestones/M3_core_consignacoes/evidencias.md)
- Entrega: [M3_core_consignacoes/entrega.md](milestones/M3_core_consignacoes/entrega.md)
