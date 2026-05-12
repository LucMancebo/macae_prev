# Planejamento de Implementação - Milestone 6

## Fases de Execução

### Fase 1: Auditoria e Preparação (Semana 1) [CONCLUÍDO]

**Objetivo:** Identificar gaps de acessibilidade e performance

**Tarefas:**

- [x] Executar auditoria com axe DevTools em 14 páginas
- [x] Coletar relatório de contraste de cores (Lighthouse)
- [x] Documentar issues de acessibilidade por severidade
- [x] Setup de Playwright e base de testes
- [x] Seed de dados para E2E

**Entregáveis:**

- Relatório de acessibilidade (axe-core JSON export)
- Plano de correção priorizado
- Setup inicial de E2E tests

---

### Fase 2: Implementação de Acessibilidade (Semana 1-2) [CONCLUÍDO]

**Objetivo:** Atingir WCAG 2.1 AA em 100%

**Tarefas:**

- [x] Adicionar skip links em layout.tsx
- [x] Corrigir razões de contraste (tailwind color palette)
- [x] Implementar ARIA labels em formulários
- [x] Adicionar focus indicators e trap em modais
- [x] Testar com screen reader (NVDA/JAWS)

**Entregáveis:**

- Componentes acessíveis reutilizáveis
- Documentação ARIA patterns usados
- Testes de validação de acessibilidade

---

### Fase 3: Manual On-line (Semana 3) [CONCLUÍDO]

**Objetivo:** Help interativo integrado

**Tarefas:**

- [x] Criar arquitetura de pages/help
- [x] Implementar HelpButton + Modal
- [x] Criar guias em Markdown
- [x] Integrar FAQ por módulo

**Entregáveis:**

- Componentes Help (HelpButton, Tooltip, FAQAccordion)
- 15+ guias de uso
- FAQ interativa
- Videotutoriais linkados

---

### Fase 4: E2E Tests e Performance (Semana 3-4) [CONCLUÍDO]

**Objetivo:** 20+ E2E tests com ≥95% pass rate; Core Web Vitals OK

**Tarefas:**

- [x] Setup Playwright com database Neon
- [x] Escrever 20 testes de fluxo crítico
- [x] Testes de responsividade (mobile/tablet/desktop)
- [x] Performance testing com Lighthouse
- [x] Integrar E2E na CI/CD

**Entregáveis:**

- 20+ E2E tests (\*.spec.ts)
- Relatório Lighthouse por página
- CI job para E2E + performance

---

## Métricas de Sucesso

| Métrica                    | Target       | Verificação     |
| -------------------------- | ------------ | --------------- |
| Acessibilidade WCAG 2.1 AA | 100% páginas | axe-core audit  |
| LCP (Core Web Vitals)      | < 2.5s       | Lighthouse      |
| FID                        | < 100ms      | Chrome DevTools |
| CLS                        | < 0.1        | Lighthouse      |
| E2E Pass Rate              | ≥ 95%        | CI logs         |
| Manual On-line             | ≥ 15 guias   | Page count      |

---

## Dependências e Bloqueadores

### Dependências

- Aprovação de M5 (pré-requisito)
- Acesso a Neon sandbox para E2E
- Credenciais YouTube (se usar videotutoriais)

### Bloqueadores Potenciais

- Descoberta de issues críticas de segurança durante E2E
- Problemas de performance em cálculos pesados
- Compatibilidade de screen readers com Next.js 15

### Estratégia de Mitigação

- Testes frequentes de performance em CI
- Validação de acessibilidade em cada commit
- Documentação de workarounds conhecidos
