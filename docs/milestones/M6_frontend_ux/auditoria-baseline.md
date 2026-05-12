# Auditoria de Acessibilidade — Baseline M6

**Data:** 12 de maio de 2026  
**Status:** ⏳ Planejado para executar

## Scripts de Auditoria Criados

### 1. axe-core Accessibility Scan

```bash
npx ts-node scripts/accessibility-audit/audit-a11y.ts
```

**O que faz:**

- Executa axe-core em 12 páginas do sistema
- Verifica WCAG 2.1 AA compliance
- Classifica violações por severidade (critical, serious, minor)
- Gera JSON report com detalhes

**Páginas auditadas:**

1. Home (/)
2. Login (/login)
3. Dashboard (/dashboard)
4. Arquivos (/dashboard/arquivos)
5. Consignações (/dashboard/consignacoes)
6. Consignatárias (/dashboard/consignatarias)
7. Margens (/dashboard/margens)
8. Produtos (/dashboard/produtos)
9. Reconciliação (/dashboard/reconciliacao)
10. Servidores (/dashboard/servidores)
11. Usuários (/dashboard/usuarios)
12. BI Dashboard (/dashboard/bi)

---

### 2. Lighthouse Performance Audit

```bash
npx ts-node scripts/accessibility-audit/audit-lighthouse.ts
```

**O que faz:**

- Mede performance, acessibilidade, best practices
- Coleta Core Web Vitals: LCP, CLS, FID
- Gera relatório detalhado por página
- Target: Performance ≥ 90, Accessibility ≥ 95, LCP < 2.5s

**Páginas auditadas:**

- Home, Login, Dashboard, BI, Consignações, Produtos

---

## Plano de Execução

### Pré-requisitos

- [ ] `npm install` (já feito)
- [ ] Dev server rodando: `npm run --prefix web dev`
- [ ] Chrome instalado (para Lighthouse)

### Execução

1. Iniciar dev server: `npm run --prefix web dev` (porta 3000)
2. Em outro terminal: `npx ts-node scripts/accessibility-audit/audit-a11y.ts`
3. Aguardar scan (~5-10 min)
4. Depois: `npx ts-node scripts/accessibility-audit/audit-lighthouse.ts` (~10-15 min)

### Artefatos Gerados

- `reports/a11y-audit-{timestamp}.json` — Resultados axe-core
- `reports/lighthouse-audit-{timestamp}.json` — Scores Lighthouse

---

## Próximos Passos

Após execução:

1. Analisar relatórios
2. Documentar achados em `a11y-findings.md`
3. Priorizar correções (critical → serious → minor)
4. Fase 2: Implementação de acessibilidade

---

## Referências

- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
