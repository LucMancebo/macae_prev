# M6 Accessibility Audit — Status Update

**Data:** 12 de maio de 2026  
**Fase:** 1 — Auditoria (Pronta para execução)

---

## ✅ Preparação Concluída

### 1. Ferramentas Instaladas

- [x] `lighthouse` (v13.3.0) — Performance + A11y scoring
- [x] `@axe-core/playwright` (v4.11.3) — WCAG 2.1 validation
- [x] `playwright` (v1.x) — Browser automation
- [x] `ts-node` — TypeScript executor

### 2. Scripts Criados

```
web/scripts/accessibility-audit/
├── audit-a11y.ts              # Valida WCAG 2.1 AA em 12 páginas
└── audit-lighthouse.ts         # Coleta Core Web Vitals
```

### 3. npm Scripts Disponíveis

```bash
npm run audit:a11y              # Executa verificação WCAG 2.1
npm run audit:lighthouse        # Executa Lighthouse audits
npm run audit:all               # Ambos em sequência
```

### 4. Documentação

- [x] `auditoria-baseline.md` — Instruções para execução
- [x] `fase1-auditoria-action-plan.md` — Plano de ação (Dias 1-2)

---

## 📋 Requisitos para Execução

Antes de rodar os audits:

```bash
# 1. Verificar Node.js
node --version              # ✅ v24.x LTS

# 2. Instalar dependências (se ainda não feito)
cd web && npm install       # ✅ Já concluído

# 3. Iniciar dev server
npm run dev                 # Porta 3000
```

---

## 🎯 Próximo Comando

Para iniciar a auditoria baseline completa:

```bash
# Terminal 1: Dev Server
cd /path/to/macae_prev/web && npm run dev

# Terminal 2: Audit (esperar servidor ~5s)
cd /path/to/macae_prev/web && npm run audit:all
```

**Tempo estimado:** 15-25 minutos para ambos os audits

---

## 📊 Resultados Esperados

Após execução, você terá:

### a11y Report (`reports/a11y-audit-{timestamp}.json`)

```json
[
  {
    "page": "Login",
    "url": "http://localhost:3000/login",
    "violations": [
      {
        "id": "color-contrast",
        "description": "Elements must have sufficient color contrast",
        "impact": "serious",
        "nodes": 3
      }
    ],
    "wcagLevel": "A"
  }
  // ... 11 more pages
]
```

### Lighthouse Report (`reports/lighthouse-audit-{timestamp}.json`)

```json
[
  {
    "page": "Dashboard",
    "scores": {
      "performance": 85,
      "accessibility": 92,
      "best_practices": 90,
      "seo": 100
    },
    "metrics": {
      "lcp": 2100,
      "cls": 0.08
    }
  }
  // ... 5 more pages
]
```

---

## 🔄 Próximas Fases

| Fase               | Duração | Status       | Próximo             |
| ------------------ | ------- | ------------ | ------------------- |
| 1 — Auditoria      | 2 dias  | ⏳ Pronta    | Executar agora      |
| 2 — Acessibilidade | 5 dias  | 📋 Planejado | Após Fase 1         |
| 3 — i18n           | 3 dias  | 📋 Planejado | Paralelo com Fase 2 |
| 4 — Dark Mode      | 3 dias  | 📋 Planejado | Semana 2            |
| 5 — Manual On-line | 5 dias  | 📋 Planejado | Semana 3            |
| 6 — E2E Tests      | 5 dias  | 📋 Planejado | Semana 3-4          |

---

## 💡 Dicas

1. **Se Lighthouse travar:** Chrome precisa estar instalado. Ou use versão headless: `--headless`
2. **Se axe-core der erro:** Dev server deve estar rodando (`localhost:3000`)
3. **Para debugar:** Adicione `--debug` aos scripts TypeScript
4. **Para salvar HTML reports:** Modifique scripts para usar `--output=html`

---

## 📞 Suporte

- Dúvidas sobre WCAG 2.1? → [WCAG 2.1 Quick Ref](https://www.w3.org/WAI/WCAG21/quickref/)
- Dúvidas sobre axe-core? → [axe Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- Dúvidas sobre CWV? → [Web Vitals](https://web.dev/vitals/)

---

**Preparação:** ✅ 100% Completa  
**Status:** Aguardando execução do usuário  
**Próxima atualização:** Após rodar `npm run audit:all`
