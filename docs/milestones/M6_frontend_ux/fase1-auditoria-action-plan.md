# Milestone 6 — Fase 1: Auditoria de Acessibilidade

**Timeline:** Semana 1 (5 dias)  
**Data Início:** 12 de maio de 2026  
**Status:** ⏳ Em Preparação

---

## 📋 Checklist de Preparação (Concluído)

- [x] Instalar dependências:
  - [x] lighthouse
  - [x] @axe-core/playwright
  - [x] ts-node (para executar scripts TS)

- [x] Criar scripts de auditoria:
  - [x] `scripts/accessibility-audit/audit-a11y.ts` — Verificar WCAG 2.1 AA
  - [x] `scripts/accessibility-audit/audit-lighthouse.ts` — Performance + A11y scores

- [x] Adicionar npm scripts:
  - [x] `npm run audit:a11y` — Rodar axe-core
  - [x] `npm run audit:lighthouse` — Rodar Lighthouse
  - [x] `npm run audit:all` — Rodar ambos

- [x] Documentar baseline:
  - [x] `docs/milestones/M6_frontend_ux/auditoria-baseline.md`

---

## 🎯 Próximos Passos (Dias 1-2)

### Dia 1: Executar Auditorias Completas

**Morning:**

```bash
# Terminal 1 — Iniciar dev server
cd web && npm run dev

# Terminal 2 — Esperar servidor ficar pronto (http://localhost:3000)

# Terminal 3 — Rodar auditoria axe-core
cd web && npm run audit:a11y

# Aguardar ~5-10 minutos
```

**Afternoon:**

```bash
# Terminal 3 — Rodar auditoria Lighthouse
cd web && npm run audit:lighthouse

# Aguardar ~10-15 minutos
```

### Dia 2: Analisar Resultados

**Tasks:**

1. [ ] Coletar relatórios de `reports/`
2. [ ] Analisar JSON dos resultados
3. [ ] Criar `a11y-findings.md` com:
   - Violações críticas encontradas
   - Páginas mais afetadas
   - Priorização de correções
   - Plano de ação detalhado

4. [ ] Atualizar `validacao.md` com baseline real
5. [ ] Documentar issues no GitHub (ou Jira/Linear)

---

## 🔍 O que será auditado

### Páginas (12 total):

1. **Home** — Público
2. **Login** — Público (MFA + LGPD)
3. **Dashboard** — Autenticado (overview)
4. **Arquivos** — CRUD + import
5. **Consignações** — CRUD + workflow
6. **Consignatárias** — CRUD
7. **Margens** — CRUD
8. **Produtos** — CRUD
9. **Reconciliação** — Reports + filtros
10. **Servidores** — CRUD
11. **Usuários** — CRUD
12. **BI Dashboard** — Gráficos + exportação

### Critérios WCAG 2.1 AA:

- [x] 1.1.1 Non-text Content (alt text)
- [x] 1.4.3 Contrast Minimum (≥ 4.5:1)
- [x] 2.1.1 Keyboard Navigation
- [x] 2.4.3 Focus Order
- [x] 2.4.7 Focus Visible
- [x] 4.1.3 Status Messages (ARIA live regions)

### Métricas de Performance (Core Web Vitals):

- [x] LCP (Largest Contentful Paint) — Target: < 2.5s
- [x] FID (First Input Delay) — Target: < 100ms
- [x] CLS (Cumulative Layout Shift) — Target: < 0.1

---

## 📊 Artefatos Esperados

Após Dias 1-2, teremos:

| Artefato          | Localização                                          | Descrição             |
| ----------------- | ---------------------------------------------------- | --------------------- |
| axe-core Report   | `reports/a11y-audit-{ts}.json`                       | Violações por página  |
| Lighthouse Report | `reports/lighthouse-audit-{ts}.json`                 | Scores e CWV          |
| Findings          | `docs/milestones/M6_frontend_ux/a11y-findings.md`    | Análise + priorização |
| Action Plan       | `docs/milestones/M6_frontend_ux/a11y-action-plan.md` | Correções detalhadas  |

---

## 🚀 Fase 2: Acessibilidade (Semana 2-3)

Com base nos achados, implementar:

- Correção de contrastes (Tailwind palette)
- ARIA labels em formulários
- Skip links
- Focus indicators
- Teste com screen reader (NVDA/JAWS)

---

## 📚 Referências

- [Auditoria Baseline](auditoria-baseline.md)
- [Documentação M6](documentacao.md)
- [Planejamento M6](planejamento.md)
- [axe DevTools Rules](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Status:** ⏳ Aguardando execução dos audits  
**Owner:** GitHub Copilot + QA Team  
**Próxima atualização:** Após Dia 2
