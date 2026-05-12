# Evidências de Funcionalidades - Milestone 6

**Status:** ⏳ PLANEJADO — Será preenchido durante implementação

As funcionalidades de M6 serão integradas e verificadas conforme progresso das fases.

---

## Fase 1: Auditoria (Semana 1)

### Evidência A1.1: Relatório axe-core

**Esperado:** JSON export de audit axe-core  
**Status:** ⏳ Pendente  
**Link:** `reports/axe-audit-baseline.json` (será criado)

---

## Fase 2: Acessibilidade (Semana 1-2)

### Evidência A2.1: Skip Link Implementado

**Descrição:** Componente SkipLink em layout.tsx  
**Esperado:** Link "Skip to content" visível ao tab  
**Arquivo:** [web/src/components/accessibility/SkipLink.tsx](../../web/src/components/accessibility/SkipLink.tsx)  
**Status:** ⏳ Pendente

### Evidência A2.2: Contrastes Ajustados

**Descrição:** Palette de cores Tailwind com contraste ≥ 4.5:1  
**Esperado:** Lighthouse contrast score 100%  
**Arquivo:** [web/tailwind.config.ts](../../web/tailwind.config.ts)  
**Status:** ⏳ Pendente

### Evidência A2.3: ARIA Labels

**Descrição:** Inputs com `aria-label` em formulários críticos  
**Exemplo:** Login, Criar Consignação, Filtros  
**Status:** ⏳ Pendente

### Evidência A2.4: Focus Indicators

**Descrição:** Todos botões/inputs com focus:ring-2  
**Arquivo:** Components em [web/src/components/](../../web/src/components/)  
**Status:** ⏳ Pendente

---

## Fase 3: Internacionalização (Semana 2)

### Evidência I3.1: next-intl Setup

**Descrição:** Integração next-intl em Next.js project  
**Arquivo:** [web/next.config.ts](../../web/next.config.ts)  
**Status:** ⏳ Pendente

### Evidência I3.2: Mensagens Traduzidas

**Arquivos:**

- [web/messages/pt-br.json](../../web/messages/pt-br.json) — PT-BR (padrão)
- [web/messages/en.json](../../web/messages/en.json) — English

**Status:** ⏳ Pendente

### Evidência I3.3: Locale Selector

**Descrição:** Dropdown na navbar para trocar idioma  
**Arquivo:** [web/src/components/navbar/LocaleSelector.tsx](../../web/src/components/navbar/LocaleSelector.tsx)  
**Status:** ⏳ Pendente

---

## Fase 4: Dark Mode (Semana 2)

### Evidência DM4.1: Tailwind Dark Mode Config

**Descrição:** Dark mode configurado em tailwind.config.ts  
**Arquivo:** [web/tailwind.config.ts](../../web/tailwind.config.ts)  
**Status:** ⏳ Pendente

### Evidência DM4.2: DarkModeToggle Component

**Descrição:** Componente com localStorage persistence  
**Arquivo:** [web/src/components/shared/DarkModeToggle.tsx](../../web/src/components/shared/DarkModeToggle.tsx)  
**Status:** ⏳ Pendente

### Evidência DM4.3: Screenshot Dark Mode

**Descrição:** Print da interface em dark mode  
**Esperado:** Arquivo: `reports/dark-mode-screenshot.png`  
**Status:** ⏳ Pendente

---

## Fase 5: Manual On-line (Semana 3)

### Evidência MO5.1: Help Pages

**Descrição:** 15+ guias em Markdown  
**Estrutura:**

```
web/public/help/
├── getting-started.md
├── login-mfa.md
├── consignacoes/
│   ├── criar-contrato.md
│   ├── aprovar-fluxo.md
│   └── portabilidade.md
├── bi/
│   ├── dashboard-operacional.md
│   └── exportar-relatorios.md
└── faq.md
```

**Status:** ⏳ Pendente

### Evidência MO5.2: HelpButton Component

**Descrição:** Abre modal com guia contextual  
**Arquivo:** [web/src/components/help/HelpButton.tsx](../../web/src/components/help/HelpButton.tsx)  
**Status:** ⏳ Pendente

### Evidência MO5.3: Tooltip Contextuais

**Descrição:** Hover tooltip em campos de form  
**Arquivo:** [web/src/components/help/Tooltip.tsx](../../web/src/components/help/Tooltip.tsx)  
**Status:** ⏳ Pendente

### Evidência MO5.4: FAQ Accordion

**Descrição:** Componente FAQ interativo  
**Arquivo:** [web/src/components/help/FAQAccordion.tsx](../../web/src/components/help/FAQAccordion.tsx)  
**Status:** ⏳ Pendente

---

## Fase 6: E2E Tests & Performance (Semana 3-4)

### Evidência E6.1: E2E Tests Suite

**Descrição:** 20+ testes Playwright  
**Arquivo:** [web/e2e/](../../web/e2e/)  
**Testes Críticos:**

- `login-mfa-lgpd.spec.ts` — Autenticação completa
- `consignacoes-crud.spec.ts` — CRUD de contratos
- `export-csv.spec.ts` — Exportação de dados
- `bi-dashboard.spec.ts` — Dashboards BI
- `responsive.spec.ts` — Testes de responsividade

**Status:** ⏳ Pendente

### Evidência E6.2: Lighthouse Reports

**Descrição:** Relatório Lighthouse por página  
**Arquivos:**

- `reports/lighthouse-dashboard.html`
- `reports/lighthouse-bi.html`
- `reports/lighthouse-consignacoes.html`

**Targets:**

- Performance: ≥ 90
- Accessibility: 100
- Best Practices: ≥ 95

**Status:** ⏳ Pendente

### Evidência E6.3: Core Web Vitals Snapshot

**Descrição:** Métricas CWV para 10 páginas principais  
**Arquivo:** `reports/core-web-vitals.json`  
**Status:** ⏳ Pendente

---

## Integração em CI/CD

### Evidência CI1: Github Actions Job

**Descrição:** Job M6 adicionado em `.github/workflows/ci.yml`  
**Tasks:**

- [ ] axe-core scan
- [ ] Lighthouse audit
- [ ] Playwright E2E tests
- [ ] i18n key validation

**Status:** ⏳ Pendente

---

## Artefatos Finais

Ao término de M6, os seguintes artefatos estarão disponíveis:

| Artefato               | Localização                    | Status |
| ---------------------- | ------------------------------ | ------ |
| axe-core audit report  | `reports/axe-audit-final.json` | ⏳     |
| Lighthouse reports     | `reports/lighthouse-*.html`    | ⏳     |
| E2E test logs          | `reports/e2e-results.json`     | ⏳     |
| i18n translation files | `web/messages/{pt-br,en}.json` | ⏳     |
| Manual on-line         | `web/public/help/**`           | ⏳     |
| Dark mode screenshots  | `reports/dark-mode-*.png`      | ⏳     |
| Performance metrics    | `reports/core-web-vitals.json` | ⏳     |

---

**Próximo:** Iniciar Fase 1 e preencher este documento com evidências reais conforme progresso.
