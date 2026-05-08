# Figma MCP Setup — MACAEPREV Design System

> Guia completo para extração e sincronização do Design System via Figma MCP

---

## 📋 Checklist de Preparação

### 1. Autenticação Figma

- [ ] Conta Figma criada e autenticada
- [ ] Acesso ao Figma file com Design System
- [ ] Token de API Figma gerado (se necessário)

### 2. Estrutura Local

- [ ] Pasta `/src/design-system/` criada
- [ ] Pasta `/src/design-system/tokens/` para variáveis
- [ ] Pasta `/src/design-system/components/` para componentes mapeados
- [ ] Pasta `/src/design-system/styles/` para CSS gerado

### 3. Configuração de Projeto

**Stack confirmada:**

- Framework: **Next.js 15+** (com breaking changes)
- UI Framework: **React 19**
- Styling: **CSS Modules + CSS Variables** (sem inline styles)
- Linter: ESLint configurado
- TypeScript: Ativo

**Convenções:**

- Componentes em `src/app/` e `src/context/`
- Estilos **exclusivamente** em arquivos `.css` ou `.module.css`
- Tipos em `src/types/`
- Utilitários em `src/utils/`

### 4. Design System Local

**Cores (Tokens CSS)**

```css
/* Backgrounds */
--bg-base: #08080d;
--bg-surface: #0f0f17;
--bg-card: #13131e;
--bg-card-hover: #1a1a28;
--bg-elevated: #1e1e2e;
--bg-input: #12121c;

/* Primary */
--color-primary: #2563eb;
--color-primary-hover: #1d4ed8;
--color-primary-light: #3b82f6;
--color-primary-subtle: rgba(37, 99, 235, 0.12);

/* Accent (Teal) */
--color-accent: #0ea5e9;
--color-accent-hover: #0284c7;
--color-accent-subtle: rgba(14, 165, 233, 0.12);

/* Semantic */
--color-success: #10b981;
--color-success-subtle: rgba(16, 185, 129, 0.12);
--color-warning: #f59e0b;
--color-warning-subtle: rgba(245, 158, 11, 0.12);
--color-danger: #ef4444;
--color-danger-subtle: rgba(239, 68, 68, 0.12);
--color-info: #8b5cf6;
--color-info-subtle: rgba(139, 92, 246, 0.12);

/* Text */
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--text-tertiary: #64748b;
--text-inverse: #0f172a;

/* Borders */
--border-default: #1e293b;
--border-hover: #334155;
--border-focus: #2563eb;
```

**Tipografia** (conforme documentação)

- Heading 1: 32px, bold
- Heading 2: 24px, semibold
- Body: 14px, regular
- Small: 12px, regular

---

## 🔄 Workflow de Extração

### Passo 1: Conectar ao Figma

```bash
# Usar o Figma MCP para autenticação
# URL esperada: https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId}
```

### Passo 2: Extrair Componentes

1. Usar `get_design_context()` para cada componente
2. Receber: código React, screenshot, hints de adaptação
3. Adaptar para stack local (estilos em `.css` separado, sem inline)

### Passo 3: Mapear Code Connect

1. Usar `mcp_figma_search_design_system()` para localizar assets
2. Usar `get_code_connect_suggestions()` para gerar mapeamentos
3. Salvar mapeamentos com `send_code_connect_mappings()`

### Passo 4: Sincronizar com Projeto

1. Criar componentes em `src/app/components/`
2. Estilos em `src/styles/components/`
3. Registrar tokens em `src/design-system/tokens/`

---

## 📂 Estrutura de Pastas Esperada

```
web/
├── src/
│   ├── app/
│   │   ├── components/           # Componentes React
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── design-system/
│   │   ├── tokens/
│   │   │   └── variables.css     # Tokens extraídos de Figma
│   │   ├── components/           # Mapeamentos Code Connect
│   │   │   └── mappings.json
│   │   └── styles/
│   │       ├── colors.css
│   │       ├── typography.css
│   │       └── spacing.css
│   ├── styles/
│   │   ├── globals.css
│   │   └── components/
│   │       ├── button.module.css
│   │       ├── card.module.css
│   │       └── ...
│   ├── types/
│   └── utils/
├── FIGMA_SETUP.md               # Este arquivo
├── package.json
└── tsconfig.json
```

---

## 🎯 Próximos Passos

1. **Compartilhar Figma URL** do Design System
2. **Confirmar node IDs** dos componentes principais
3. **Executar extração** via Figma MCP
4. **Revisar e adaptar** código gerado para convenções locais
5. **Registrar Code Connect** mappings

---

## 📌 Referências

- [Design System Docs](../tecnico/design_system.md)
- [Especificações Técnicas](../tecnico/especificacoes_tecnicas.md)
- Figma File: _(fornecer URL)_
