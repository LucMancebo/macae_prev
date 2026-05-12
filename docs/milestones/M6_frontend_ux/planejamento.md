# Planejamento de Implementação - Milestone 6

## Fases de Execução

### Fase 1: Auditoria e Preparação (Semana 1)

**Objetivo:** Identificar gaps de acessibilidade e performance

**Tarefas:**

- [ ] Executar auditoria com axe DevTools em 14 páginas
- [ ] Coletar relatório de contraste de cores (Lighthouse)
- [ ] Documentar issues de acessibilidade por severidade
- [ ] Setup de Playwright e base de testes
- [ ] Seed de dados para E2E

**Entregáveis:**

- Relatório de acessibilidade (axe-core JSON export)
- Plano de correção priorizado
- Setup inicial de E2E tests

---

### Fase 2: Implementação de Acessibilidade (Semana 1-2)

**Objetivo:** Atingir WCAG 2.1 AA em 100%

**Tarefas:**

- [ ] Adicionar skip links em layout.tsx
- [ ] Corrigir razões de contraste (tailwind color palette)
- [ ] Implementar ARIA labels em formulários
- [ ] Adicionar focus indicators e trap em modais
- [ ] Testar com screen reader (NVDA/JAWS)

**Entregáveis:**

- Componentes acessíveis reutilizáveis
- Documentação ARIA patterns usados
- Testes de validação de acessibilidade

---

### Fase 3: Internacionalização (Semana 2)

**Objetivo:** Suporte PT-BR (default) e EN

**Tarefas:**

- [ ] Integrar next-intl no projeto
- [ ] Estruturar arquivos de tradução
- [ ] Traduzir interface principal (auth, dashboard, consignacoes)
- [ ] Adicionar locale selector em navbar
- [ ] Testar locale switching e persistence

**Entregáveis:**

- messages/pt-br.json, messages/en.json
- Componente LocaleSelector
- CI check para chaves não traduzidas

---

### Fase 4: Dark Mode (Semana 2)

**Objetivo:** Suporte a modo escuro via Tailwind

**Tarefas:**

- [ ] Configurar Tailwind dark: mode
- [ ] Implementar DarkModeToggle com localStorage
- [ ] Aplicar classes dark: em componentes chave
- [ ] Testar em Safari, Chrome, Firefox
- [ ] Respeitar prefers-color-scheme

**Entregáveis:**

- DarkModeToggle component
- Tailwind dark mode configuration
- UI validation em dark mode

---

### Fase 5: Manual On-line (Semana 3)

**Objetivo:** Help interativo integrado

**Tarefas:**

- [ ] Criar arquitetura de pages/help
- [ ] Implementar HelpButton + Modal
- [ ] Criar 15+ guias em Markdown
- [ ] Implementar Tooltip contextuais
- [ ] Integrar FAQ por módulo
- [ ] Gravar/linkar 3 videotutoriais

**Entregáveis:**

- Componentes Help (HelpButton, Tooltip, FAQAccordion)
- 15+ guias de uso
- FAQ interativa
- Videotutoriais linkados

---

### Fase 6: E2E Tests e Performance (Semana 3-4)

**Objetivo:** 20+ E2E tests com ≥95% pass rate; Core Web Vitals OK

**Tarefas:**

- [ ] Setup Playwright com database Neon
- [ ] Escrever 20 testes de fluxo crítico
- [ ] Testes de responsividade (mobile/tablet/desktop)
- [ ] Performance testing com Lighthouse
- [ ] Integrar E2E na CI/CD

**Entregáveis:**

- 20+ E2E tests (\*.spec.ts)
- Relatório Lighthouse por página
- CI job para E2E + performance

---

## Métricas de Sucesso

| Métrica                    | Target         | Verificação     |
| -------------------------- | -------------- | --------------- |
| Acessibilidade WCAG 2.1 AA | 100% páginas   | axe-core audit  |
| LCP (Core Web Vitals)      | < 2.5s         | Lighthouse      |
| FID                        | < 100ms        | Chrome DevTools |
| CLS                        | < 0.1          | Lighthouse      |
| E2E Pass Rate              | ≥ 95%          | CI logs         |
| Manual On-line             | ≥ 15 guias     | Page count      |
| Idiomas                    | 2 (PT-BR + EN) | next-intl check |

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
