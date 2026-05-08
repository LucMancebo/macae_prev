# 📋 FIGMA MCP — Checklist de Preparação

**Status:** ✅ Ambiente Preparado
**Data:** 8 de maio de 2026

---

## ✅ Estrutura Criada

- [x] Pasta `/src/design-system/tokens/` — Tokens CSS
  - [x] `variables.css` — CSS Variables completas

- [x] Pasta `/src/design-system/components/` — Code Connect
  - [x] `code-connect-mappings.json` — Template de mapeamentos

- [x] Documentação
  - [x] `FIGMA_SETUP.md` — Guia completo de setup
  - [x] `.figma-mcp-instructions.md` — Instruções para extrair componentes
  - [x] `COMPONENT_TEMPLATE.md` — Template padrão de componente
  - [x] Este checklist

---

## 📋 Pré-requisitos para Uso

### Antes de Extrair Componentes

- [ ] **Figma URL** do Design System (compartilhar com Copilot)
  - Formato: `https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId}`
  - Extrair: fileKey, nodeId dos componentes

- [ ] **Componentes identificados no Figma** (lista dos que vão ser extraídos)
  - [ ] Button (Primary, Secondary, Danger)
  - [ ] Card
  - [ ] Badge (Success, Warning, Danger, Info)
  - [ ] Input/TextField
  - [ ] Modal
  - [ ] Sidebar
  - [ ] Header
  - [ ] Outros: ****\_\_\_****

- [ ] **Tokens verificados** no CSS Variables
  - [ ] Cores
  - [ ] Tipografia
  - [ ] Espaçamento
  - [ ] Shadows

---

## 🔄 Workflow de Uso

### 1. Extrair Componente

```
Copilot → Figma MCP (get_design_context)
↓
Recebe: Código React, screenshot, hints
```

### 2. Adaptar para MACAEPREV

```
✅ Separar CSS em .module.css
✅ Usar tokens, não hardcoded
✅ Remover CSS inline
✅ Tipar Props
```

### 3. Criar no Projeto

```
src/app/components/{Component}/
├── {Component}.tsx
├── {component}.module.css
├── {Component}.types.ts
└── index.ts
```

### 4. Registrar Code Connect

```
Figma MCP → send_code_connect_mappings()
↓
Componente reconhecido no Figma ✓
```

---

## 🔧 Ferramentas Disponíveis (Figma MCP)

| Ferramenta                          | Uso                         | Status    |
| ----------------------------------- | --------------------------- | --------- |
| `get_design_context()`              | Extrair código + screenshot | ✅ Pronto |
| `mcp_figma_search_design_system()`  | Localizar components/tokens | ✅ Pronto |
| `get_code_connect_suggestions()`    | Sugerir mapeamentos         | ✅ Pronto |
| `send_code_connect_mappings()`      | Registrar Code Connect      | ✅ Pronto |
| `mcp_figma_generate_figma_design()` | Sync código → Figma         | ✅ Pronto |

---

## 📂 Arquivos de Referência

```
web/
├── .figma-mcp-instructions.md    ← Ler isto primeiro!
├── FIGMA_SETUP.md                ← Guia de setup
├── AGENTS.md                      ← Regras de código
├── src/
│   ├── design-system/
│   │   ├── tokens/
│   │   │   └── variables.css      ← 🎨 Tokens do Design System
│   │   ├── components/
│   │   │   └── code-connect-mappings.json
│   │   └── COMPONENT_TEMPLATE.md  ← Copiar para novos componentes
│   └── app/
│       └── components/            ← Aqui vão os componentes
```

---

## 🚀 Próximos Passos (Para Iniciar)

1. **Compartilhar Figma URL** do Design System

   ```
   URL: https://figma.com/design/...
   ```

2. **Confirmar componentes** a extrair

   ```
   [ ] Button, [ ] Card, [ ] Badge, [ ] Input, [ ] ...
   ```

3. **Chamar Figma MCP** para extrair

   ```javascript
   // Copilot irá usar:
   mcp_figma_use_figma() ou get_design_context()
   ```

4. **Revisar e adaptar** código
   - Remover CSS inline
   - Usar tokens CSS
   - Tipar Props

5. **Registrar Code Connect**
   ```javascript
   send_code_connect_mappings();
   ```

---

## ✨ Convenções IMPORTANTES

| Regra                     | ✅ SIM                                     | ❌ NÃO             |
| ------------------------- | ------------------------------------------ | ------------------ |
| CSS externo `.module.css` | `import styles from "./button.module.css"` | `style={{...}}`    |
| Cores                     | `var(--color-primary)`                     | `#2563eb`          |
| Tipagem                   | `interface ButtonProps {...}`              | `props: any`       |
| Componentes               | `/src/app/components/`                     | `/src/components/` |
| Estilos                   | `/src/styles/` ou `.module.css`            | Inline styles      |

---

## 📞 Suporte

**Documentação local:**

- [README.md](./README.md)
- [01-QUICK_START.md](./01-QUICK_START.md)
- [02-FIGMA_SETUP.md](./02-FIGMA_SETUP.md)
- [Design System Docs](../tecnico/design_system.md)

**Stack do Projeto:**

- Next.js 15+ (com breaking changes)
- React 19
- TypeScript 5+
- CSS Modules + CSS Variables

---

**Status: ✅ PRONTO PARA USAR FIGMA MCP**
