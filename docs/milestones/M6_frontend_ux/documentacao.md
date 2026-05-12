# M6 — Documentação Técnica: Frontend & UX

## 1. Visão Geral

A Milestone 6 melhora a qualidade, acessibilidade e usabilidade do sistema MACAEPREV. Foca em validação de WCAG 2.1 AA, performance (Core Web Vitals) e na criação de um manual on-line interativo para usuários finais.

### Objetivos

- **Objetivos Funcionais:**
  - Criar manual on-line interativo (POC 13)
  - Melhorar experiência em todos os dispositivos (mobile-first)

- **Objetivos Técnicos:**
  - Validar WCAG 2.1 AA em 100% das páginas
  - Atingir Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
  - Configurar E2E tests com database real

## 2. Escopo Técnico

### 2.1 Acessibilidade (WCAG 2.1 AA)

#### Critérios A

- **1.1.1 Non-text Content:** Todas as imagens possuem `alt` text descritivo
- **1.4.3 Contrast (Minimum):** Razão de contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande
- **2.1.1 Keyboard:** Navegação completa por teclado (Tab, Enter, Escape)
- **2.4.3 Focus Order:** Ordem lógica de foco em formulários
- **4.1.3 Status Messages:** ARIA live regions para notificações

#### Critérios AA

- **2.4.7 Focus Visible:** Indicador de foco visível em todos elementos focáveis
- **3.2.4 Consistent Identification:** Componentes reutilizáveis com comportamento consistente
- **3.3.4 Error Prevention:** Validação client-side antes de submit

### 2.2 Performance (Core Web Vitals)

| Métrica                            | Target  | Estratégia                              |
| ---------------------------------- | ------- | --------------------------------------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | Code splitting, lazy loading de imagens |
| **FID** (First Input Delay)        | < 100ms | Web Workers para cálculos pesados       |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | Dimensões de layout pré-definidas       |

### 2.3 Manual On-line Interativo

#### Componentes

- **HelpButton:** Abre modal com guia contextual
- **Tooltip:** Explicação de campo on-hover
- **Breadcrumb:** Navegação com links para páginas ajuda
- **FAQAccordion:** Perguntas frequentes por módulo
- **VideoEmbed:** Integração YouTube/Vimeo

#### Estrutura de Conteúdo

```
help/
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

## 3. Arquitetura

### 3.1 Estrutura Frontend

```
web/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── dashboard/
│   │   │   ├── help/
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── accessibility/
│   │   │   ├── SkipLink.tsx
│   │   │   ├── AriaLive.tsx
│   │   │   └── FocusTrap.tsx
│   │   ├── help/
│   │   │   ├── HelpButton.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── FAQAccordion.tsx
│   │   │   └── VideoEmbed.tsx
│   │   └── ...
├── next.config.ts
└── tailwind.config.ts
```

### 3.2 E2E Tests com Database Real

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: "npm run --prefix api dev",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});

// Fixture: database com seed
beforeEach(async () => {
  await resetDatabase(); // Neon sandbox
  await seedTestData();
});
```

## 4. Implementação

### Fase 1 (Semana 1-2): Acessibilidade [CONCLUÍDO]

- [x] Auditoria com axe DevTools em todas páginas
- [x] Corrigir contrastes de cor
- [x] Adicionar ARIA labels e roles
- [x] Testar navegação por teclado
- [x] Implementar SkipLink, FocusTrap

### Fase 2 (Semana 2-3): Manual On-line [CONCLUÍDO]

- [x] Criar componentes Help (HelpButton, etc)
- [x] Escrever guias em Markdown (react-markdown integrados)
- [x] Integrar FAQ por módulo
- [x] Rota dinâmica (`[slug]`) para leitura em public/help/

### Fase 3 (Paralela): E2E Tests [CONCLUÍDO]

- [x] Setup Playwright + database Neon sandbox
- [x] Escrever 20+ testes de fluxo crítico
- [x] Validar responsividade (mobile, tablet, desktop)
- [x] Performance testing com Lighthouse

## 5. Validação

### 5.1 Critérios de Sucesso

- ✅ 100% de páginas atendendo WCAG 2.1 AA
- ✅ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- ✅ 20+ E2E tests com 95%+ pass rate
- ✅ Manual on-line com ≥ 15 guias + FAQ

### 5.2 Testing

- **Accessibility:** axe DevTools + manual WCAG audit
- **Performance:** Lighthouse + Chrome DevTools
- **Responsiveness:** BrowserStack / Device Labs
- **E2E:** Playwright com múltiplos cenários

---

**Referências:**

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Playwright Docs](https://playwright.dev/)
