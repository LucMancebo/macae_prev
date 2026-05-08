# 🎨 Instruções para Figma MCP — MACAEPREV Design System

Estas instruções garantem que componentes extraídos do Figma seguem as convenções do projeto MACAEPREV.

---

## 🎯 Objetivo

Extrair componentes do Figma Design System e integrá-los ao codebase respeitando:

- Stack: Next.js 15+, React 19, TypeScript
- Styling: CSS Modules/CSS Variables (sem inline styles)
- Estrutura: `/src/app/components/` para componentes, `/src/styles/` para CSS
- Design Tokens: `/src/design-system/tokens/variables.css`

---

## 📝 Workflow

### 1️⃣ Extração (get_design_context)

Ao extrair um componente do Figma:

```javascript
// Usar Figma MCP para obter:
// - Código React reference (pode ter CSS inline)
// - Screenshot do design
// - Hints de adaptação
```

**Saída esperada:**

- Código React com exemplo
- Screenshot do componente
- Links para documentação Design System

### 2️⃣ Adaptação (Aplicar Convenções)

Quando receber código gerado, **SEMPRE**:

✅ **Obrigatório:**

1. Separar CSS em arquivo `.module.css` dedicado
2. Usar CSS Variables do `/src/design-system/tokens/variables.css`
3. Remover todo CSS inline (`style={{...}}`)
4. Criar interface de Props em arquivo `.types.ts`
5. Adicionar JSDoc comments
6. Verificar acessibilidade (WCAG AA)

❌ **Proibido:**

- CSS inline em componentes
- Hardcoded colors (usar tokens)
- Importar Bootstrap, Tailwind ou outro framework de CSS global
- Componentes sem tipagem TypeScript

### 3️⃣ Estrutura de Pastas

Para cada componente extraído:

```
src/app/components/Button/
├── Button.tsx              # Componente principal
├── button.module.css       # Estilos (CSS Modules)
├── Button.types.ts         # Interface Props
├── Button.stories.tsx      # Storybook (opcional)
└── index.ts                # Exports
```

### 4️⃣ Template Padrão

Usar template de `src/design-system/COMPONENT_TEMPLATE.md` como base.

**Resumido:**

```tsx
// Button.tsx
import React from "react";
import { ButtonProps } from "./Button.types";
import styles from "./button.module.css";

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  ...props
}) => (
  <button className={styles[`button--${variant}`]} {...props}>
    {children}
  </button>
);
```

```css
/* button.module.css */
.button {
  background-color: var(--color-primary);
  /* usar TOKENS, não hardcoded */
}
```

### 5️⃣ Validação

Antes de commitar:

- [ ] Sem CSS inline
- [ ] Estilos em `.module.css`
- [ ] Props tipadas (`.types.ts`)
- [ ] Tokens CSS usados (não hardcoded)
- [ ] Componente testável (exports corretos)
- [ ] JSDoc comments

---

## 🔗 Code Connect Mappings

Após criar componente local, registrar no Figma:

```json
{
  "nodeId": "123:456",
  "componentName": "Button/Primary",
  "source": "src/app/components/Button/Button.tsx",
  "label": "React",
  "template": "...código JS..."
}
```

**Usar:** `mcp_figma_send_code_connect_mappings()`

---

## 📚 Referências

- [Design System Docs](../tecnico/design_system.md)
- [Component Template](../../web/src/design-system/COMPONENT_TEMPLATE.md)
- [CSS Variables](../../web/src/design-system/tokens/variables.css)
- [AGENTS.md](../../web/AGENTS.md) — No inline styles!

---

## ⚠️ Notas Importantes

1. **Dark Mode**: Todos os tokens já assumem tema escuro
2. **Responsividade**: Usar CSS Grid/Flexbox, não breakpoints hardcoded
3. **Acessibilidade**: Testar com screen readers (Next.js built-in)
4. **Tipagem**: `ButtonProps extends HTMLAttributes<HTMLButtonElement>`

---

**Status: ✅ PRONTO PARA EXTRAIR COMPONENTES**
