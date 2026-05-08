# Estrutura de Diretórios do Projeto — MACAEPREV

## Estrutura do Código-Fonte

```
macae_prev/
├── docs/                              # Documentação do projeto
│   ├── especificacoes_tecnicas.md
│   ├── dicionario_dados.md
│   ├── modelo_er.md
│   ├── Poc_respondida.md
│   └── milestones/                    # Entregáveis por milestone
│       ├── M1_fundacao_infra/
│       │   ├── documentacao.md
│       │   ├── testes.md
│       │   ├── validacao.md
│       │   ├── evidencias.md
│       │   └── entrega.md
│       ├── M2_seguranca/
│       │   ├── documentacao.md
│       │   ├── testes.md
│       │   ├── validacao.md
│       │   ├── evidencias.md
│       │   └── entrega.md
│       ├── M3_core_consignacoes/
│       │   ├── documentacao.md
│       │   ├── testes.md
│       │   ├── validacao.md
│       │   ├── evidencias.md
│       │   └── entrega.md
│       ├── M4_integracao_folha/
│       │   ├── documentacao.md
│       │   ├── testes.md
│       │   ├── validacao.md
│       │   ├── evidencias.md
│       │   └── entrega.md
│       ├── M5_relatorios_bi/
│       │   ├── documentacao.md
│       │   ├── testes.md
│       │   ├── validacao.md
│       │   ├── evidencias.md
│       │   └── entrega.md
│       ├── M6_frontend_ux/
│       │   ├── documentacao.md
│       │   ├── testes.md
│       │   ├── validacao.md
│       │   ├── evidencias.md
│       │   └── entrega.md
│       └── M7_suporte_operacao/
│           ├── documentacao.md
│           ├── testes.md
│           ├── validacao.md
│           ├── evidencias.md
│           └── entrega.md
│
├── api/                               # Backend — Node.js API REST
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.ts                  # Entry point
│   │   ├── app.ts                     # Express/Fastify config
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── auth.ts
│   │   ├── hooks/                     # Hooks e Middlewares globais
│   │   │   └── error-handler.ts       # Tratamento centralizado de erros
│   │   ├── modules/
│   │   │   ├── servidores/
│   │   │   │   ├── servidores.controller.ts
│   │   │   │   ├── servidores.service.ts
│   │   │   │   ├── servidores.routes.ts
│   │   │   │   └── servidores.dto.ts
│   │   │   ├── consignatarias/
│   │   │   │   ├── consignatarias.controller.ts
│   │   │   │   ├── consignatarias.service.ts
│   │   │   │   ├── consignatarias.routes.ts
│   │   │   │   └── consignatarias.dto.ts
│   │   │   ├── produtos/
│   │   │   │   ├── produtos.controller.ts
│   │   │   │   ├── produtos.service.ts
│   │   │   │   ├── produtos.routes.ts
│   │   │   │   └── produtos.dto.ts
│   │   │   ├── margens/
│   │   │   │   ├── margens.controller.ts
│   │   │   │   ├── margens.service.ts
│   │   │   │   ├── margens.routes.ts
│   │   │   │   └── margens.dto.ts
│   │   │   ├── contratos/
│   │   │   │   ├── contratos.controller.ts
│   │   │   │   ├── contratos.service.ts
│   │   │   │   ├── contratos.routes.ts
│   │   │   │   └── contratos.dto.ts
│   │   │   ├── parcelas/
│   │   │   │   ├── parcelas.controller.ts
│   │   │   │   ├── parcelas.service.ts
│   │   │   │   ├── parcelas.routes.ts
│   │   │   │   └── parcelas.dto.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.middleware.ts
│   │   │   ├── auditoria/
│   │   │   │   ├── auditoria.controller.ts
│   │   │   │   ├── auditoria.service.ts
│   │   │   │   ├── auditoria.routes.ts
│   │   │   │   └── auditoria.middleware.ts
│   │   │   ├── integracao-folha/
│   │   │   │   ├── integracao.controller.ts
│   │   │   │   ├── integracao.service.ts
│   │   │   │   ├── integracao.routes.ts
│   │   │   │   ├── csv-parser.ts
│   │   │   │   └── csv-generator.ts
│   │   │   ├── portabilidade/
│   │   │   │   ├── portabilidade.controller.ts
│   │   │   │   ├── portabilidade.service.ts
│   │   │   │   └── portabilidade.routes.ts
│   │   │   ├── aprovacao/
│   │   │   │   ├── aprovacao.controller.ts
│   │   │   │   ├── aprovacao.service.ts
│   │   │   │   └── aprovacao.routes.ts
│   │   │   └── relatorios/
│   │   │       ├── relatorios.controller.ts
│   │   │       ├── relatorios.service.ts
│   │   │       ├── relatorios.routes.ts
│   │   │       └── csv-export.ts
│   │   ├── shared/
│   │   │   ├── middlewares/
│   │   │   │   ├── error-handler.ts
│   │   │   │   ├── rate-limiter.ts
│   │   │   │   └── cors.ts
│   │   │   ├── utils/
│   │   │   │   ├── crypto.ts
│   │   │   │   ├── pagination.ts
│   │   │   │   └── validators.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── migrations/
│   │       └── prisma.config.ts           # Configuração de seed e DB
│   └── src/__tests__/                 # Testes E2E (Jest + Supertest)
│       └── auth.e2e.test.ts
│   └── jest.config.js
│
├── web/                               # Frontend — Next.js + React + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── login.module.css
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── styles/                    # Estilos Globais
│   │   │   └── globals.css
│   │   │   ├── servidores/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── servidores.module.css
│   │   │   ├── consignatarias/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── consignatarias.module.css
│   │   │   ├── contratos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── novo/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── contratos.module.css
│   │   │   ├── margens/
│   │   │   │   ├── page.tsx
│   │   │   │   └── margens.module.css
│   │   │   ├── portabilidade/
│   │   │   │   ├── page.tsx
│   │   │   │   └── portabilidade.module.css
│   │   │   ├── integracao/
│   │   │   │   ├── page.tsx
│   │   │   │   └── integracao.module.css
│   │   │   ├── relatorios/
│   │   │   │   ├── page.tsx
│   │   │   │   └── relatorios.module.css
│   │   │   ├── configuracoes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── perfis/page.tsx
│   │   │   │   ├── fluxos/page.tsx
│   │   │   │   └── configuracoes.module.css
│   │   │   └── auditoria/
│   │   │       ├── page.tsx
│   │   │       └── auditoria.module.css
│   │   ├── components/                # Componentes reutilizáveis
│   │   │   ├── ui/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   └── Button.module.css
│   │   │   │   ├── Input/
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── Input.module.css
│   │   │   │   ├── Table/
│   │   │   │   │   ├── Table.tsx
│   │   │   │   │   └── Table.module.css
│   │   │   │   ├── Modal/
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   └── Modal.module.css
│   │   │   │   ├── Card/
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── Card.module.css
│   │   │   │   └── Chart/
│   │   │   │       ├── Chart.tsx
│   │   │   │       └── Chart.module.css
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Sidebar.module.css
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── Header.module.css
│   │   │   │   └── Footer/
│   │   │   │       ├── Footer.tsx
│   │   │   │       └── Footer.module.css
│   │   │   └── shared/
│   │   │       ├── AuditLog/
│   │   │       │   ├── AuditLog.tsx
│   │   │       │   └── AuditLog.module.css
│   │   │       ├── ExportCSV/
│   │   │       │   └── ExportCSV.tsx
│   │   │       └── HelpTooltip/
│   │   │           ├── HelpTooltip.tsx
│   │   │           └── HelpTooltip.module.css
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useFetch.ts
│   │   │   └── useDebounce.ts
│   │   ├── services/                  # API client
│   │   │   └── api.ts
│   │   ├── context/                   # React contexts (AuthContext)
│   │   │   └── AuthContext.tsx
│   │   ├── types/                     # TypeScript types
│   │   │   └── auth.ts
│   │   └── utils/                     # Utilitários
│   │       ├── formatters.ts
│   │       └── validators.ts
│   └── tests/
│       ├── components/
│       └── pages/
│
├── infra/                             # Infraestrutura AWS
│   ├── terraform/                     # ou CloudFormation
│   │   ├── main.tf
│   │   ├── rds.tf
│   │   ├── ecs.tf
│   │   └── s3.tf
│   └── docker/
│       ├── Dockerfile.api
│       ├── Dockerfile.web
│       └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── README.md
└── .gitignore
```

## Padrões de Código

| Regra | Padrão |
|-------|--------|
| **Estilização** | Apenas arquivos `.css` e `.module.css` — **nunca** inline styles ou styled-jsx |
| **Componentes** | Cada componente em pasta própria com `.tsx` + `.module.css` |
| **API Routes** | `controller → service → prisma` (3 camadas) |
| **Nomes de arquivo** | kebab-case para pastas, PascalCase para componentes React |
| **TypeScript** | `strict: true`, sem `any` |
| **Testes** | Jest + React Testing Library (frontend), Jest + Supertest (API) |
