# Arquitetura Figma MCP — MACAEPREV

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FIGMA DESIGN SYSTEM                           │
│                    (Fonte de Verdade do Design)                     │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ 1. Figma MCP: get_design_context()
                     │    ↓ Retorna: Código React, Screenshot, Hints
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   COPILOT + FIGMA MCP TOOLS                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 1. get_design_context() → Extrai código + screenshot         │  │
│  │ 2. search_design_system() → Busca assets (tokens, componentes)│  │
│  │ 3. get_code_connect_suggestions() → Sugerir mapeamentos      │  │
│  │ 4. send_code_connect_mappings() → Registrar no Figma         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ 2. Adaptar para convenções locais
                     │    (Remover CSS inline, usar tokens)
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CODEBASE MACAEPREV (Next.js 15 + React 19)            │
│                                                                     │
│  src/                                                              │
│  ├── design-system/                                              │
│  │   ├── tokens/                                                 │
│  │   │   └── variables.css ← 🎨 Tokens do Design System          │
│  │   ├── components/                                             │
│  │   │   └── code-connect-mappings.json                          │
│  │   └── COMPONENT_TEMPLATE.md ← Template padrão                │
│  │                                                               │
│  ├── app/components/  ← 🎯 Componentes extraídos              │
│  │   ├── Button/                                                │
│  │   │   ├── Button.tsx                                         │
│  │   │   ├── button.module.css                                  │
│  │   │   ├── Button.types.ts                                    │
│  │   │   └── index.ts                                           │
│  │   ├── Card/                                                  │
│  │   ├── Badge/                                                 │
│  │   └── ...                                                    │
│  │                                                               │
│  └── styles/components/  ← Estilos compartilhados              │
│      ├── button.module.css                                      │
│      ├── card.module.css                                        │
│      └── ...                                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


FLUXO DE CRIAÇÃO DE COMPONENTE
═══════════════════════════════════════════════════════════════════

1. FIGMA → EXTRAÇÃO
   ├─ URL: figma.com/design/{fileKey}/?node-id={nodeId}
   ├─ Copilot: "Use Figma MCP para extrair componente X"
   └─ Resultado: Código React + screenshot

2. ADAPTAÇÃO → CONVENÇÕES LOCAIS
   ├─ ❌ Remover CSS inline
   ├─ ✅ Criar arquivo .module.css
   ├─ ✅ Usar CSS Variables (--token-name)
   ├─ ✅ Tipar Props (interface ButtonProps)
   └─ ✅ Adicionar JSDoc comments

3. IMPLEMENTAÇÃO → PROJETO
   ├─ Pasta: src/app/components/{Component}/
   ├─ Arquivos:
   │  ├─ {Component}.tsx (lógica)
   │  ├─ {component}.module.css (estilos)
   │  ├─ {Component}.types.ts (tipos)
   │  └─ index.ts (exports)
   └─ Teste: import { Button } from "@/app/components/Button"

4. REGISTRO → CODE CONNECT
   ├─ Preparar mapping:
   │  ├─ nodeId (do Figma)
   │  ├─ componentName (Button/Primary)
   │  ├─ source (src/app/components/Button/Button.tsx)
   │  └─ label (React)
   ├─ Copilot: "Registre no Code Connect"
   └─ Resultado: Figma reconhece componente local


CSS VARIABLES — MACAEPREV
═════════════════════════════════════════════════════════════════

Arquivo: src/design-system/tokens/variables.css

:root {
  /* Backgrounds */
  --bg-base: #08080d;
  --bg-surface: #0f0f17;
  --bg-card: #13131e;

  /* Colors */
  --color-primary: #2563eb;
  --color-accent: #0ea5e9;
  --color-success: #10b981;

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;

  /* Typography */
  --font-size-h1: 32px;
  --font-size-body: 14px;

  /* Spacing */
  --spacing-md: 12px;
  --spacing-lg: 16px;
}

Uso em .module.css:
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-lg);
}


VALIDAÇÃO ANTES DE COMMITAR
═════════════════════════════════════════════════════════════════

Para cada componente:

[ ] Sem CSS inline (style={{}})
[ ] Estilos em arquivo .module.css
[ ] Props tipadas (interface ou type)
[ ] Usa CSS Variables (não hardcoded)
[ ] JSDoc comments no componente
[ ] Exporta no index.ts
[ ] Testável com import { Component }
[ ] Code Connect registrado no Figma
```

---

## Referências Rápidas

### Imports Padrão

```tsx
import React from "react";
import { ComponentProps } from "./Component.types";
import styles from "./component.module.css";
```

### Estrutura de Componente

```tsx
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props específicas
}

export const Component: React.FC<ComponentProps> = (props) => (
  <div className={styles.component}>{props.children}</div>
);
```

### CSS Module

```css
.component {
  background-color: var(--bg-card);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.component:hover {
  background-color: var(--bg-card-hover);
}
```

---

**Status: ✅ PRONTO PARA EXTRAIR DO FIGMA**
