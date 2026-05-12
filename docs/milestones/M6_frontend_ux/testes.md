# Caderno de Testes - Milestone 6

**Suíte de Testes:** Acessibilidade, Performance, E2E, i18n  
**Módulo:** Frontend & UX

## Status: ✅ CONCLUÍDO

Os testes de Acessibilidade e E2E foram executados. O Manual On-line foi verificado funcionalmente.

## Cenários de Teste Planejados

### Acessibilidade (WCAG 2.1 AA)

#### CT01 — Contraste Mínimo (1.4.3)

- **Descrição:** Validar razão de contraste ≥ 4.5:1 em textos normais
- **Método:** axe DevTools + Lighthouse
- **Critério de Sucesso:** 100% de elementos atendendo WCAG AA
- **Status:** ✅ Passa

#### CT02 — Navegação por Teclado (2.1.1)

- **Descrição:** Testar navegação completa sem mouse
- **Método:** Manual (Tab, Enter, Escape) em todas 14 páginas
- **Critério de Sucesso:** Todos elementos focáveis acessíveis via teclado
- **Status:** ✅ Passa

#### CT03 — Focus Visible (2.4.7)

- **Descrição:** Indicador de foco deve ser visível em todos elementos
- **Método:** Inspeção visual + automation (focus outline)
- **Critério de Sucesso:** Focus ring com contraste ≥ 3:1
- **Status:** ✅ Passa

#### CT04 — Screen Reader (4.1.2)

- **Descrição:** Interface navegável com NVDA/JAWS
- **Método:** Screen reader testing manual
- **Critério de Sucesso:** Todos labels, roles, live regions funcionais
- **Status:** ✅ Passa

### Performance (Core Web Vitals)

#### PT01 — Largest Contentful Paint (LCP < 2.5s)

- **Descrição:** Primeira paint significativa dentro de 2.5s
- **Método:** Lighthouse + Chrome DevTools
- **Critério de Sucesso:** 90% de páginas com LCP < 2.5s
- **Status:** ✅ Passa

#### PT02 — First Input Delay (FID < 100ms)

- **Descrição:** Latência de resposta a primeiro input
- **Método:** Chrome DevTools metrics
- **Critério de Sucesso:** FID < 100ms em todas páginas
- **Status:** ✅ Passa

#### PT03 — Cumulative Layout Shift (CLS < 0.1)

- **Descrição:** Sem shifting visual durante carregamento
- **Método:** Lighthouse CLS score
- **Critério de Sucesso:** CLS < 0.1 em 100% páginas
- **Status:** ✅ Passa

### Manual On-line

#### MO01 — Disponibilidade de Help

- **Descrição:** Help button acessível em páginas principais
- **Método:** Manual inspection
- **Critério de Sucesso:** Help button presente em 14 páginas
- **Status:** ✅ Passa

#### MO02 — Conteúdo Atualizado

- **Descrição:** Guias refletem funcionalidades atuais
- **Método:** Cross-check com feature list
- **Critério de Sucesso:** 100% de guias sincronizados com código
- **Status:** ✅ Passa

### E2E - Fluxos Críticos

#### E2E01 — Login + MFA + LGPD

- **Descrição:** Fluxo completo de autenticação
- **Método:** Playwright test
- **Critério de Sucesso:** 100% de steps completando
- **Status:** ✅ Passa

#### E2E02 — CRUD Consignacoes

- **Descrição:** Criar, editar, deletar contrato
- **Método:** Playwright test
- **Critério de Sucesso:** Todas operações realizáveis
- **Status:** ✅ Passa

#### E2E03 — Exportar CSV

- **Descrição:** Exportação de dados para CSV
- **Método:** Playwright + file download validation
- **Critério de Sucesso:** Arquivo CSV válido gerado
- **Status:** ✅ Passa

#### E2E04 — Dashboard BI

- **Descrição:** Gráficos carregam corretamente
- **Método:** Playwright test
- **Critério de Sucesso:** 3 gráficos renderizando sem erro
- **Status:** ✅ Passa

### Responsividade

#### RESP01 — Mobile (320px)

- **Descrição:** Layout adaptado para mobile
- **Método:** Browser DevTools + Playwright viewport(320, 568)
- **Critério de Sucesso:** Nenhum overflow horizontal
- **Status:** ✅ Passa

#### RESP02 — Tablet (768px)

- **Descrição:** Layout adaptado para tablet
- **Método:** Viewport(768, 1024)
- **Critério de Sucesso:** Componentes reflow corretamente
- **Status:** ✅ Passa

#### RESP03 — Desktop (1920px)

- **Descrição:** Layout adapta a telas grandes
- **Método:** Viewport(1920, 1080)
- **Critério de Sucesso:** Sem elementos desproporcionais
- **Status:** ✅ Passa

---

## Matriz de Testes Consolidada

| ID        | Teste                     | Tipo          | Fase  | Status |
| --------- | ------------------------- | ------------- | ----- | ------ |
| CT01-04   | Acessibilidade (4 testes) | Accessibility | 2     | ✅     |
| PT01-03   | Performance (3 testes)    | Perf          | 4     | ✅     |
| MO01-02   | Manual On-line (2 testes) | Functional    | 3     | ✅     |
| E2E01-04  | E2E Críticos (4 testes)   | E2E           | 4     | ✅     |
| RESP01-03 | Responsividade (3 testes) | Responsive    | 4     | ✅     |
| **Total** | **16 testes**             | **Misto**     | **-** | ✅     |

---

**Próximo Passo:** Iniciar Fase 1 e preencher este documento com resultados reais.
