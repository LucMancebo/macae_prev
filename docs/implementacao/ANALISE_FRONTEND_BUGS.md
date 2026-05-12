# Análise de Problemas Frontend — Dashboard

**Data:** 12/05/2026

## 🔴 Problemas Identificados

### 1. Inconsistência de Design Entre Páginas

#### Problema:

- **Página de Arquivos**: Design "showoff" com hero section gradiente, badges, etc. (mais para demonstração)
- **Página de Consignações**: Design funcional e limpo com tabela, filtros, modal (melhor para trabalho real)
- **Páginas de Cadastros** (Produtos, Margens, Servidores, Usuários): Mixto de padrões, sem consistência clara

#### Recomendação:

Padronizar todas as páginas para seguir o padrão de **Consignações**, que é mais funcional e profissional.

---

### 2. Bug de Paginação (0 → 1 → 11)

#### Problema:

A navegação de páginas está pulando números ao invés de ir sequencialmente (0 → 1 → 11 ao invés de 1 → 2 → 3).

#### Causa Provável:

Há **inconsistência entre abordagens de paginação**:

| Página         | Abordagem           | Implementação                                        |
| -------------- | ------------------- | ---------------------------------------------------- |
| Consignações   | useState local      | `const [page, setPage] = useState(1)`                |
| Produtos       | useState local      | `const [page, setPage] = useState(1)`                |
| Margens        | useState local      | `const [page, setPage] = useState(1)`                |
| Servidores     | useState meta (API) | `const [meta, setMeta] = useState({ page: 1, ... })` |
| Consignatárias | useState meta (API) | `const [meta, setMeta] = useState({ page: 1, ... })` |
| Usuários       | useState meta (API) | `const [meta, setMeta] = useState({ page: 1, ... })` |

**Problema específico**: Páginas com `meta` estão recebendo paginação da API mas tentando atualizá-la localmente, causando dessincronização.

#### Sintoma Observado:

Ao clicar "Próxima", a página pode:

- Ir de 0 para 1 (se API retorna 0-indexed)
- Depois para 11 (se há desalinhamento no cálculo de próxima página)

---

### 3. Falta de Paginação em Algumas Páginas

#### Problema:

Página de **Usuários** possui estado `meta` mas **não renderiza** a paginação.

#### Impacto:

Usuário não consegue navegar entre páginas de usuários.

---

### 4. Design Disparado — Página de Arquivos

#### Problema:

Página de Arquivos usa design muito elaborado (gradientes, animações, hero section) que **não combina** com o resto do dashboard.

#### Impacto:

- Visual inconsistente
- Difícil de manter
- Tira foco da funcionalidade

---

## ✅ Plano de Correção

### Fase 1: Padronizar Design

1. Refatorar **página de arquivos** para padrão de consignações
2. Garantir todas as tabelas, filtros e modais seguem mesmo padrão
3. Validar CSS modules em todas as páginas

### Fase 2: Corrigir Paginação

1. Consolidar abordagem: **manter estado local** (não da API) [✅ CONCLUÍDO]
2. Garantir inicialização em **page = 1** (1-indexed) [✅ CONCLUÍDO]
3. Validar cálculo de `totalPages` [✅ CONCLUÍDO]
4. Adicionar paginação na página de usuários [✅ CONCLUÍDO]

### Fase 3: Testar

1. Testar navegação em todas as páginas com paginação
2. Verificar comportamento edge cases (1 página, 0 resultados)
3. Validar estado após criar/deletar itens

---

## 📝 Arquivos a Serem Modificados

### Design (refatoração):

- `web/src/app/dashboard/arquivos/page.tsx`
- `web/src/app/dashboard/arquivos/arquivos.module.css`
- `web/src/app/dashboard/produtos/page.tsx`
- `web/src/app/dashboard/margens/page.tsx`

### Paginação (fix):

- `web/src/app/dashboard/servidores/page.tsx`
- `web/src/app/dashboard/consignatarias/page.tsx`
- `web/src/app/dashboard/usuarios/page.tsx` (ADD paginação)

---

## 🎯 Referência — Padrão Correto (Consignações)

Use como template:

- **Layout**: `.pageHeader` container com `.titleArea` e `.filters`
- **Tabela**: `.tableContainer` com `.table` responsiva
- **Paginação**: Botões "Anterior/Próxima" com info `Página X de Y`
- **Modal**: `.modalOverlay` com `.modalContent` para detalhes
- **Status**: Badges com cores semânticas

Arquivo: `web/src/app/dashboard/consignacoes/consignacoes.module.css`
