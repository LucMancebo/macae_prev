# Caderno de Testes - Milestone 6

**Suíte de Testes:** Acessibilidade, Performance, E2E, i18n  
**Módulo:** Frontend & UX

## Status: ⏳ PLANEJADO

Os testes serão executados durante as fases 2-6 de implementação.

## Cenários de Teste Planejados

### Acessibilidade (WCAG 2.1 AA)

#### CT01 — Contraste Mínimo (1.4.3)

- **Descrição:** Validar razão de contraste ≥ 4.5:1 em textos normais
- **Método:** axe DevTools + Lighthouse
- **Critério de Sucesso:** 100% de elementos atendendo WCAG AA
- **Status:** ⏳ Planejado

#### CT02 — Navegação por Teclado (2.1.1)

- **Descrição:** Testar navegação completa sem mouse
- **Método:** Manual (Tab, Enter, Escape) em todas 14 páginas
- **Critério de Sucesso:** Todos elementos focáveis acessíveis via teclado
- **Status:** ⏳ Planejado

#### CT03 — Focus Visible (2.4.7)

- **Descrição:** Indicador de foco deve ser visível em todos elementos
- **Método:** Inspeção visual + automation (focus outline)
- **Critério de Sucesso:** Focus ring com contraste ≥ 3:1
- **Status:** ⏳ Planejado

#### CT04 — Screen Reader (4.1.2)

- **Descrição:** Interface navegável com NVDA/JAWS
- **Método:** Screen reader testing manual
- **Critério de Sucesso:** Todos labels, roles, live regions funcionais
- **Status:** ⏳ Planejado

### Performance (Core Web Vitals)

#### PT01 — Largest Contentful Paint (LCP < 2.5s)

- **Descrição:** Primeira paint significativa dentro de 2.5s
- **Método:** Lighthouse + Chrome DevTools
- **Critério de Sucesso:** 90% de páginas com LCP < 2.5s
- **Status:** ⏳ Planejado

#### PT02 — First Input Delay (FID < 100ms)

- **Descrição:** Latência de resposta a primeiro input
- **Método:** Chrome DevTools metrics
- **Critério de Sucesso:** FID < 100ms em todas páginas
- **Status:** ⏳ Planejado

#### PT03 — Cumulative Layout Shift (CLS < 0.1)

- **Descrição:** Sem shifting visual durante carregamento
- **Método:** Lighthouse CLS score
- **Critério de Sucesso:** CLS < 0.1 em 100% páginas
- **Status:** ⏳ Planejado

### Internacionalização (i18n)

#### I18N01 — Locale Switching

- **Descrição:** Alternância entre PT-BR e EN sem reload
- **Método:** E2E test com Playwright
- **Critério de Sucesso:** Texto de interface muda sem page reload
- **Status:** ⏳ Planejado

#### I18N02 — Persistência de Locale

- **Descrição:** Preferência de idioma salva em localStorage
- **Método:** Verificar localStorage após switch
- **Critério de Sucesso:** Locale persiste entre sessões
- **Status:** ⏳ Planejado

#### I18N03 — Mensagens Não Traduzidas

- **Descrição:** Nenhuma chave i18n faltando
- **Método:** CI check com next-intl
- **Critério de Sucesso:** 0 chaves faltando em EN/PT-BR
- **Status:** ⏳ Planejado

### Dark Mode

#### DM01 — Toggle Funcional

- **Descrição:** Botão de dark mode em navbar
- **Método:** Manual + E2E test
- **Critério de Sucesso:** Dark/light mode alternando corretamente
- **Status:** ⏳ Planejado

#### DM02 — Contraste em Dark Mode

- **Descrição:** Contraste ≥ 4.5:1 também em dark mode
- **Método:** axe-core no modo dark
- **Critério de Sucesso:** WCAG AA mesmo em dark mode
- **Status:** ⏳ Planejado

### Manual On-line

#### MO01 — Disponibilidade de Help

- **Descrição:** Help button acessível em páginas principais
- **Método:** Manual inspection
- **Critério de Sucesso:** Help button presente em 14 páginas
- **Status:** ⏳ Planejado

#### MO02 — Conteúdo Atualizado

- **Descrição:** Guias refletem funcionalidades atuais
- **Método:** Cross-check com feature list
- **Critério de Sucesso:** 100% de guias sincronizados com código
- **Status:** ⏳ Planejado

### E2E - Fluxos Críticos

#### E2E01 — Login + MFA + LGPD

- **Descrição:** Fluxo completo de autenticação
- **Método:** Playwright test
- **Critério de Sucesso:** 100% de steps completando
- **Status:** ⏳ Planejado

#### E2E02 — CRUD Consignacoes

- **Descrição:** Criar, editar, deletar contrato
- **Método:** Playwright test
- **Critério de Sucesso:** Todas operações realizáveis
- **Status:** ⏳ Planejado

#### E2E03 — Exportar CSV

- **Descrição:** Exportação de dados para CSV
- **Método:** Playwright + file download validation
- **Critério de Sucesso:** Arquivo CSV válido gerado
- **Status:** ⏳ Planejado

#### E2E04 — Dashboard BI

- **Descrição:** Gráficos carregam corretamente
- **Método:** Playwright test
- **Critério de Sucesso:** 3 gráficos renderizando sem erro
- **Status:** ⏳ Planejado

### Responsividade

#### RESP01 — Mobile (320px)

- **Descrição:** Layout adaptado para mobile
- **Método:** Browser DevTools + Playwright viewport(320, 568)
- **Critério de Sucesso:** Nenhum overflow horizontal
- **Status:** ⏳ Planejado

#### RESP02 — Tablet (768px)

- **Descrição:** Layout adaptado para tablet
- **Método:** Viewport(768, 1024)
- **Critério de Sucesso:** Componentes reflow corretamente
- **Status:** ⏳ Planejado

#### RESP03 — Desktop (1920px)

- **Descrição:** Layout adapta a telas grandes
- **Método:** Viewport(1920, 1080)
- **Critério de Sucesso:** Sem elementos desproporcionais
- **Status:** ⏳ Planejado

---

## Matriz de Testes Consolidada

| ID        | Teste                     | Tipo          | Fase          | Status |
| --------- | ------------------------- | ------------- | ------------- | ------ |
| CT01-04   | Acessibilidade (4 testes) | Accessibility | 2             | ⏳     |
| PT01-03   | Performance (3 testes)    | Perf          | 6             | ⏳     |
| I18N01-03 | i18n (3 testes)           | Functional    | 3             | ⏳     |
| DM01-02   | Dark Mode (2 testes)      | Functional    | 4             | ⏳     |
| MO01-02   | Manual On-line (2 testes) | Functional    | 5             | ⏳     |
| E2E01-04  | E2E Críticos (4 testes)   | E2E           | 6             | ⏳     |
| RESP01-03 | Responsividade (3 testes) | Responsive    | 6             | ⏳     |
| **Total** | **24 testes**             | **Misto**     | **6 semanas** | ⏳     |

---

**Próximo Passo:** Iniciar Fase 1 e preencher este documento com resultados reais.
