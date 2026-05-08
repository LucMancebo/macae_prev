# 🚀 QUICK START — Figma MCP MACAEPREV

**Tempo de leitura:** 5 minutos

---

## 1️⃣ Verificar Ambiente

```bash
# Dentro da pasta /web, verificar estrutura
ls -la src/design-system/tokens/
# Deve ter: variables.css

ls -la src/app/components/
# Deve estar vazio ou com componentes existentes
```

✅ **Se tudo existir**, pular para Passo 2.

❌ **Se faltar algo**, executar setup:

```bash
bash setup-figma-mcp.sh
```

---

## 2️⃣ Preparar Figma

**Você precisa de:**

1. ✅ URL do Figma Design System

   ```
   https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId}
   ```

2. ✅ Node IDs dos componentes a extrair
   - Exemplo: `1:23`, `45:67`, etc.

**Como obter node IDs?**

- Abrir componente no Figma
- URL mostra: `?node-id=123-456` (convert para `123:456`)

---

## 3️⃣ Extrair Componente

**Chamar Copilot com:**

```
"Use Figma MCP para extrair o componente Button do Design System.

URL Figma: https://figma.com/design/...?node-id=1:23

Instruções:
1. Extraia usando get_design_context()
2. Adapte para MACAEPREV (remova CSS inline, use tokens)
3. Crie em src/app/components/Button/
4. Registre no Code Connect"
```

---

## 4️⃣ Revisar Código Gerado

Após Copilot entregar o componente:

### ❌ O que NÃO aceitar

```tsx
// ❌ ERRADO: CSS inline
<button style={{
  backgroundColor: '#2563eb',
  padding: '12px 16px'
}} />

// ❌ ERRADO: Hardcoded color
.button { color: '#f1f5f9'; }
```

### ✅ O que ACEITAR

```tsx
// ✅ CORRETO: CSS externo
<button className={styles.button} />

// ✅ CORRETO: CSS Variables
.button {
  color: var(--text-primary);
  background-color: var(--color-primary);
}
```

---

## 5️⃣ Estrutura Esperada

Após extrair um componente, deve ter:

```
src/app/components/Button/
├── Button.tsx              ← Componente React
├── button.module.css       ← Estilos (CSS Modules)
├── Button.types.ts         ← Types/Interfaces
├── index.ts                ← Exports
└── (opcional) Button.stories.tsx
```

**Mínimo obrigatório:** `Button.tsx` + `button.module.css` + `Button.types.ts`

---

## 6️⃣ Testar Importação

Criar arquivo de teste rápido:

```tsx
// src/app/test-component.tsx
import { Button } from "@/app/components/Button";

export default function TestPage() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  );
}
```

✅ Se compilar sem erros → Sucesso!

---

## 7️⃣ Registrar Code Connect

**Após testar**, registrar no Figma:

```javascript
// Dados necessários:
{
  nodeId: "1:23",  // Do Figma
  componentName: "Button/Primary",
  source: "src/app/components/Button/Button.tsx",
  label: "React"
}
```

**Copilot irá:**

1. Coletar dados do componente
2. Gerar Code Connect mapping
3. Registrar no Figma via `send_code_connect_mappings()`

---

## 📚 Referências Rápidas

| Preciso de...          | Arquivo                                   |
| ---------------------- | ----------------------------------------- |
| Template de componente | `src/design-system/COMPONENT_TEMPLATE.md` |
| CSS Variables          | `src/design-system/tokens/variables.css`  |
| Guia completo          | `../02-FIGMA_SETUP.md`                    |
| Checklist              | `../04-CHECKLIST.md`                      |
| Arquitetura            | `../03-ARQUITETURA.md`                    |

---

## ⚡ Comandos Rápidos

```bash
# Verificar espaço do projeto
du -sh src/

# Listar componentes criados
find src/app/components -type f -name "*.tsx"

# Verificar se há CSS inline (deve estar vazio)
grep -r "style={{" src/app/components/

# Validar imports
grep -r "import.*variables.css" src/
```

---

## ❓ Troubleshooting

### Erro: "CSS inline encontrado"

**Solução:** Remover `style={{...}}` e criar arquivo `.module.css`

### Erro: "Color hardcoded em .module.css"

**Solução:** Trocar `#2563eb` por `var(--color-primary)`

### Erro: "Props não tipadas"

**Solução:** Criar `Button.types.ts` e importar em `Button.tsx`

### Erro: "Componente não importa"

**Solução:** Verificar `index.ts` em src/app/components/Button/

```tsx
export { Button } from "./Button";
export type { ButtonProps } from "./Button.types";
```

---

## ✅ Checklist Final

Antes de fazer commit:

- [ ] Componente testável (`npm run dev` + página de teste)
- [ ] Sem CSS inline
- [ ] CSS em `.module.css`
- [ ] Props tipadas
- [ ] CSS Variables usados (não hardcoded)
- [ ] index.ts exporta corretamente
- [ ] Code Connect registrado

---

**Pronto para começar? 🎉**

👉 Compartilhe a URL do Figma e comece a extrair componentes!
