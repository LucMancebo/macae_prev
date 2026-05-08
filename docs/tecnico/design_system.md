# Design System — MACAEPREV Sistema de Consignação

> Design system moderno com tema escuro inspirado nas referências Taskplus, CRM e Console, adaptado à identidade visual institucional de Macaé.

---

## Mockup do Dashboard

![Mockup do Dashboard MACAEPREV](c:\Users\Tales Mancebo\Desktop\Lucas\SkyX\macae_prev\docs\tecnico\dashboard_mockup.png)

---

## 1. Filosofia de Design

### Princípios

| Princípio | Aplicação |
|-----------|-----------|
| **Clareza** | Informação financeira deve ser legível à primeira vista — KPIs grandes, status coloridos |
| **Eficiência** | Operações em no máximo 3 cliques — sidebar sempre visível, ações contextuais |
| **Confiança** | Visual institucional sóbrio — cores frias, tipografia limpa, sem excessos |
| **Acessibilidade** | Contraste WCAG AA em dark mode — textos claros sobre fundos escuros |

### Inspiração dos Exemplos

| Referência | O que aplicamos |
|------------|----------------|
| **Taskplus** | KPI cards com ícones e variação vs. período anterior, sidebar com ícones, tabela de tarefas com filtros |
| **CRM (Mintify)** | Status badges coloridos, busca + filtros inline na tabela, layout limpo de listagem |
| **Console** | Navegação por categorias na sidebar, dados densos com boa legibilidade, tons de roxo/azul |

---

## 2. Paleta de Cores

### Cores Institucionais (Macaé)

As cores foram derivadas da identidade visual da Prefeitura de Macaé (azul institucional) e adaptadas para um tema escuro moderno.

### Backgrounds (Superfícies)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-base` | `#08080d` | Fundo principal da aplicação |
| `--bg-surface` | `#0f0f17` | Sidebar, áreas laterais |
| `--bg-card` | `#13131e` | Cards, painéis elevados |
| `--bg-card-hover` | `#1a1a28` | Hover em cards e linhas de tabela |
| `--bg-elevated` | `#1e1e2e` | Modais, dropdowns, popovers |
| `--bg-input` | `#12121c` | Campos de formulário |

### Cores Primárias

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#2563eb` | Botões primários, links, elementos de destaque |
| `--color-primary-hover` | `#1d4ed8` | Hover de botões primários |
| `--color-primary-light` | `#3b82f6` | Ícones ativos, badges primários |
| `--color-primary-subtle` | `rgba(37, 99, 235, 0.12)` | Background sutil para badges e KPI cards |

### Cores de Accent (Teal — Identidade Macaé)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-accent` | `#0ea5e9` | Accent secundário, gráficos, destaques |
| `--color-accent-hover` | `#0284c7` | Hover de accent |
| `--color-accent-subtle` | `rgba(14, 165, 233, 0.12)` | Background de KPI cards accent |

### Cores Semânticas

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-success` | `#10b981` | Status "Ativo", "Aprovado", "Descontada" |
| `--color-success-subtle` | `rgba(16, 185, 129, 0.12)` | Badge background success |
| `--color-warning` | `#f59e0b` | Status "Pendente", "Em análise" |
| `--color-warning-subtle` | `rgba(245, 158, 11, 0.12)` | Badge background warning |
| `--color-danger` | `#ef4444` | Status "Cancelado", "Bloqueado", erros |
| `--color-danger-subtle` | `rgba(239, 68, 68, 0.12)` | Badge background danger |
| `--color-info` | `#8b5cf6` | Status "Portabilidade", informações auxiliares |
| `--color-info-subtle` | `rgba(139, 92, 246, 0.12)` | Badge background info |

### Textos

| Token | Hex | Uso |
|-------|-----|-----|
| `--text-primary` | `#f1f5f9` | Títulos, valores de KPI, dados principais |
| `--text-secondary` | `#94a3b8` | Labels, descrições, textos auxiliares |
| `--text-tertiary` | `#64748b` | Placeholders, textos desabilitados |
| `--text-inverse` | `#0f172a` | Texto sobre backgrounds claros |

### Bordas

| Token | Hex | Uso |
|-------|-----|-----|
| `--border-default` | `#1e293b` | Bordas de cards, separadores |
| `--border-hover` | `#334155` | Bordas em hover |
| `--border-focus` | `#2563eb` | Bordas em foco (inputs, botões) |

---

## 3. Tipografia

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

> **Inter** — Importar via Google Fonts. Usada para toda a interface.
> **JetBrains Mono** — Usada em dados tabulares, códigos, IDs.

### Escala Tipográfica

| Token | Size | Weight | Line Height | Uso |
|-------|------|--------|-------------|-----|
| `--text-display` | 32px | 700 | 1.2 | Título da página (Dashboard) |
| `--text-heading` | 24px | 600 | 1.3 | Bem-vindo, Nome do módulo |
| `--text-subheading` | 18px | 600 | 1.4 | Títulos de cards e seções |
| `--text-body` | 14px | 400 | 1.5 | Texto padrão, células de tabela |
| `--text-body-bold` | 14px | 600 | 1.5 | Labels de formulário, headers de tabela |
| `--text-small` | 12px | 400 | 1.5 | Captions, timestamps, tooltips |
| `--text-kpi` | 28px | 700 | 1.1 | Valores numéricos de KPI cards |
| `--text-kpi-label` | 12px | 500 | 1.4 | Labels de KPI cards (ALL CAPS, letter-spacing 0.05em) |

---

## 4. Espaçamento

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

| Uso | Token |
|-----|-------|
| Padding interno de cards | `--space-5` (20px) |
| Gap entre KPI cards | `--space-4` (16px) |
| Padding da sidebar | `--space-4` (16px) |
| Margem entre seções | `--space-8` (32px) |
| Padding do conteúdo principal | `--space-6` (24px) |

---

## 5. Border Radius

```css
--radius-sm: 4px;    /* Badges, tags */
--radius-md: 8px;    /* Inputs, botões */
--radius-lg: 12px;   /* Cards */
--radius-xl: 16px;   /* Modais */
--radius-full: 9999px; /* Avatares, badges circulares */
```

---

## 6. Sombras

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-glow-primary: 0 0 20px rgba(37, 99, 235, 0.15);
--shadow-glow-accent: 0 0 20px rgba(14, 165, 233, 0.15);
```

---

## 7. Componentes

### 7.1 Sidebar

- Largura: **240px** (expandida), **64px** (colapsada)
- Background: `--bg-surface`
- Logo MACAEPREV no topo com `--color-accent`
- Itens: ícone + label, padding `--space-3` vertical
- Item ativo: background `--color-primary-subtle`, borda esquerda 3px `--color-primary`
- Item hover: background `--bg-card-hover`
- Separadores entre categorias de menu
- Perfil do usuário no rodapé da sidebar

### 7.2 KPI Cards

- Background: `--bg-card` com borda sutil `--border-default`
- Padding: `--space-5`
- Border-radius: `--radius-lg`
- Layout: Label no topo (small, uppercase), valor grande (kpi font), indicador de variação
- Ícone no canto superior direito com background sutil da cor semântica
- Hover: `--bg-card-hover` com `--shadow-sm`
- Transição: `all 0.2s ease`

### 7.3 Tabelas de Dados

- Header: `--text-body-bold`, color `--text-secondary`, background `--bg-surface`
- Cells: `--text-body`, color `--text-primary`
- Linhas alternadas: não usar zebra — usar hover (`--bg-card-hover`)
- Borda inferior: 1px `--border-default`
- Toolbar acima: busca + filtros + botão exportar CSV + botão de ação
- Paginação no rodapé

### 7.4 Status Badges

| Status | Background | Texto | Borda |
|--------|------------|-------|-------|
| Ativo / Aprovado | `--color-success-subtle` | `--color-success` | nenhuma |
| Pendente / Em análise | `--color-warning-subtle` | `--color-warning` | nenhuma |
| Cancelado / Bloqueado | `--color-danger-subtle` | `--color-danger` | nenhuma |
| Portabilidade / Info | `--color-info-subtle` | `--color-info` | nenhuma |

- Formato: pill (border-radius full), padding 4px 10px, font-size 12px, font-weight 500

### 7.5 Botões

| Variante | Background | Texto | Borda |
|----------|------------|-------|-------|
| Primary | `--color-primary` | `#ffffff` | nenhuma |
| Secondary | `transparent` | `--text-secondary` | 1px `--border-default` |
| Ghost | `transparent` | `--text-secondary` | nenhuma |
| Danger | `--color-danger` | `#ffffff` | nenhuma |

- Padding: 8px 16px
- Border-radius: `--radius-md`
- Font: `--text-body-bold`
- Hover: filtro brightness(1.1) ou background mais claro
- Transição: `all 0.15s ease`
- Loading state: spinner animado

### 7.6 Formulários (Inputs)

- Background: `--bg-input`
- Borda: 1px `--border-default`
- Border-radius: `--radius-md`
- Padding: 10px 14px
- Focus: borda `--border-focus` + `--shadow-glow-primary`
- Label: `--text-body-bold`, `--text-secondary`, margin-bottom 6px
- Error: borda `--color-danger`, mensagem abaixo em `--color-danger`

### 7.7 Modais

- Background: `--bg-elevated`
- Overlay: `rgba(0, 0, 0, 0.7)` com backdrop-filter blur(4px)
- Border-radius: `--radius-xl`
- Shadow: `--shadow-lg`
- Header: título + botão fechar
- Footer: botões de ação alinhados à direita
- Animação: fade in + scale de 0.95 para 1

### 7.8 Gráficos

- Paleta de cores para gráficos: `#2563eb`, `#0ea5e9`, `#10b981`, `#f59e0b`, `#8b5cf6`, `#ec4899`
- Fundo do gráfico: transparente sobre `--bg-card`
- Grid lines: `--border-default` com opacity 0.3
- Labels: `--text-secondary`, `--text-small`
- Tooltip: `--bg-elevated` com `--shadow-md`

### 7.9 Painel de Auditoria (Log Inline)

- Exibido na parte inferior das telas de cadastro
- Background: `--bg-surface`
- Cada entrada: ícone de ação + texto + timestamp + usuário
- Cores de ação: inclusão (verde), alteração (azul), exclusão (vermelho)
- Scroll vertical com max-height: 200px

---

## 8. Layout

### Grid Principal

```
┌──────────┬────────────────────────────────────────┐
│          │  Header (64px)                         │
│ Sidebar  ├────────────────────────────────────────┤
│ (240px)  │                                        │
│          │  Conteúdo Principal                    │
│          │  padding: 24px                          │
│          │  max-width: 1400px                      │
│          │                                        │
│          │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│          │  │ KPI │ │ KPI │ │ KPI │ │ KPI │     │
│          │  └─────┘ └─────┘ └─────┘ └─────┘     │
│          │                                        │
│          │  ┌──────────────────────────────────┐  │
│          │  │ Tabela de Dados                  │  │
│          │  │ toolbar: busca + filtros + export │  │
│          │  │ ─────────────────────────────── │  │
│          │  │ row row row row row              │  │
│          │  │ paginação                        │  │
│          │  └──────────────────────────────────┘  │
└──────────┴────────────────────────────────────────┘
```

### Breakpoints

| Token | Valor | Comportamento |
|-------|-------|---------------|
| `--bp-mobile` | 640px | Sidebar oculta (menu hamburger), KPIs empilham |
| `--bp-tablet` | 1024px | Sidebar colapsada (64px), KPIs 2x2 |
| `--bp-desktop` | 1280px | Layout completo |
| `--bp-wide` | 1536px | Conteúdo com max-width |

---

## 9. Animações e Micro-interações

```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease-out;
```

| Elemento | Animação |
|----------|----------|
| Sidebar item hover | Background fade `--transition-fast` |
| Card hover | Elevação + glow sutil `--transition-base` |
| Modal entrada | Fade in + scale(0.95→1) `--transition-slow` |
| Badge status | Pulse sutil para "Pendente" (keyframe) |
| Botão click | Scale(0.97) + release `--transition-fast` |
| Tabela row hover | Background slide `--transition-fast` |
| KPI value load | Count-up animation ao carregar página |
| Toast notification | Slide in da direita `--transition-slow` |

---

## 10. Ícones

- **Biblioteca**: Lucide React (lucide-react)
- **Tamanho padrão**: 20px na sidebar, 16px em botões/badges
- **Cor padrão**: `--text-secondary`
- **Cor ativo**: `--color-primary-light`
- **Stroke width**: 1.5px

### Mapeamento de Ícones por Módulo

| Módulo | Ícone |
|--------|-------|
| Dashboard | `LayoutDashboard` |
| Servidores | `Users` |
| Consignatárias | `Building2` |
| Contratos | `FileText` |
| Margens | `PieChart` |
| Portabilidade | `ArrowLeftRight` |
| Integração | `FileSpreadsheet` |
| Relatórios | `BarChart3` |
| Configurações | `Settings` |
| Auditoria | `ShieldCheck` |
| Ajuda | `HelpCircle` |

---

## 11. Mapeamento de Status por Contexto

| Entidade | Ativo | Pendente | Negativo | Especial |
|----------|-------|----------|----------|----------|
| **Contrato** | Ativo (verde) | Pendente (amarelo) | Cancelado (vermelho) | Suspenso (roxo) |
| **Parcela** | Descontada (verde) | Prevista (azul) | Não Descontada (vermelho) | — |
| **Consignatária** | Ativa (verde) | — | Inativa (vermelho) | Suspensa (amarelo) |
| **Servidor** | Ativo (verde) | — | Inativo (cinza) | Bloqueado (vermelho) |
| **Aprovação** | Aprovado (verde) | Em análise (amarelo) | Rejeitado (vermelho) | Escalonado (roxo) |

---

## 12. Arquivos CSS (Estrutura)

```
web/src/
├── app/globals.css              ← Variáveis CSS, reset, tipografia, utilitários globais
├── components/ui/
│   ├── Button/Button.module.css
│   ├── Input/Input.module.css
│   ├── Table/Table.module.css
│   ├── Card/Card.module.css
│   ├── Modal/Modal.module.css
│   ├── Badge/Badge.module.css
│   └── Chart/Chart.module.css
├── components/layout/
│   ├── Sidebar/Sidebar.module.css
│   ├── Header/Header.module.css
│   └── Footer/Footer.module.css
└── app/[modulo]/[modulo].module.css  ← Estilos específicos por página
```

> **Regra absoluta**: Apenas `.css` e `.module.css`. Nunca inline styles. Nunca styled-jsx.
