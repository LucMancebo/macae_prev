# 📚 Figma MCP — Documentação MACAEPREV Design System

> Guia completo para extrair e sincronizar o Design System via Figma MCP

---

## 🎯 Começar Por Aqui

### 🏃 Quero começar RÁPIDO (5 min)

👉 Leia: [QUICK START](./01-QUICK_START.md)

### 📖 Quero entender TUDO (15 min)

👉 Leia: [FIGMA SETUP COMPLETO](./02-FIGMA_SETUP.md)

### 🏗️ Quero ver a ARQUITETURA

👉 Leia: [ARQUITETURA E FLUXO](./03-ARQUITETURA.md)

### ✅ Quero validar PREPARAÇÃO

👉 Leia: [CHECKLIST](./04-CHECKLIST.md)

### 🎨 Preciso extrair COMPONENTES

👉 Leia: [INSTRUÇÕES DE EXTRAÇÃO](./05-INSTRUCOES_EXTRACAO.md)

---

## 📋 Arquivos Disponíveis

| Arquivo                                                  | Descrição                   | Tempo  |
| -------------------------------------------------------- | --------------------------- | ------ |
| [01-QUICK_START.md](./01-QUICK_START.md)                 | Passo a passo simplificado  | 5 min  |
| [02-FIGMA_SETUP.md](./02-FIGMA_SETUP.md)                 | Guia completo e detalhado   | 15 min |
| [03-ARQUITETURA.md](./03-ARQUITETURA.md)                 | Diagramas e fluxos visuais  | 10 min |
| [04-CHECKLIST.md](./04-CHECKLIST.md)                     | Checklist de preparação     | 5 min  |
| [05-INSTRUCOES_EXTRACAO.md](./05-INSTRUCOES_EXTRACAO.md) | Instruções passo a passo    | 10 min |
| [RESUMO.md](./RESUMO.md)                                 | Resumo visual da preparação | 3 min  |

---

## 🔧 Referência Técnica

### Design Tokens

- **Arquivo:** `web/src/design-system/tokens/variables.css`
- **Contém:** 90+ CSS Variables (cores, tipografia, espaçamento, etc)
- **Referência JSON:** `web/src/design-system/tokens/tokens.json`

### Templates

- **Componente:** `web/src/design-system/COMPONENT_TEMPLATE.md`
- **Code Connect:** `web/src/design-system/components/code-connect-mappings.json`

### Instruções Específicas

- **Extração:** `web/.figma-mcp-instructions.md`

---

## ⚡ Atalhos Rápidos

```
Para iniciar:      → Leia QUICK_START.md
Para aprender:     → Leia FIGMA_SETUP.md
Para visualizar:   → Leia ARQUITETURA.md
Para validar:      → Leia CHECKLIST.md
Para extrair:      → Leia INSTRUCOES_EXTRACAO.md
Para resumo:       → Leia RESUMO.md
```

---

## 🚀 Fluxo Típico

1. **PREPARAÇÃO** → Validar ambiente (CHECKLIST)
2. **APRENDIZADO** → Entender fluxo (QUICK_START ou SETUP)
3. **COMPREENSÃO** → Ver arquitetura (ARQUITETURA)
4. **EXECUÇÃO** → Extrair primeiro componente (INSTRUCOES_EXTRACAO)
5. **REVISÃO** → Validar código gerado
6. **INTEGRAÇÃO** → Registrar no Code Connect

---

## 🎨 Design System Token Categories

✅ **56 Cores:**

- Backgrounds (6)
- Primary (4)
- Accent/Teal (3)
- Semantic (8)
- Text (4)
- Borders (3)

✅ **15 Tipografia:**

- Font families (2)
- Heading 1, 2, 3 (9)
- Body, Small (4)

✅ **Outros (20+):**

- Espaçamento (7)
- Border radius (4)
- Shadows (4)
- Transitions (3)
- Z-index (7)

---

## ❓ Perguntas Frequentes

**P: Por onde começo?**
R: Leia [QUICK_START.md](./01-QUICK_START.md) (5 min) ou [FIGMA_SETUP.md](./02-FIGMA_SETUP.md)

**P: Como extrair um componente?**
R: Siga [INSTRUCOES_EXTRACAO.md](./05-INSTRUCOES_EXTRACAO.md)

**P: Quais CSS Variables estão disponíveis?**
R: Veja `web/src/design-system/tokens/variables.css`

**P: Como validar que tudo está pronto?**
R: Leia [CHECKLIST.md](./04-CHECKLIST.md)

**P: O que devo fazer antes de começar?**
R: Prepare a URL do Figma Design System e liste os componentes a extrair

---

## 📂 Estrutura de Documentação

```
docs/
└── figma-mcp/
    ├── README.md (este arquivo)
    ├── 01-QUICK_START.md
    ├── 02-FIGMA_SETUP.md
    ├── 03-ARQUITETURA.md
    ├── 04-CHECKLIST.md
    ├── 05-INSTRUCOES_EXTRACAO.md
    └── RESUMO.md
```

---

## ✨ Status

**✅ Ambiente Completamente Preparado**

Todos os arquivos, tokens e templates estão prontos para uso.

**Próxima ação:** Escolha um documento acima e comece! 🚀
