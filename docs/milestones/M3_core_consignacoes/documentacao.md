# Documentação de Escopo — Milestone 3: Core Consignações

## 1. Identificação

| Campo | Valor |
|-------|-------|
| **Milestone** | M3 — Core Consignações |
| **Data Início Planejado** | Maio 2026 |
| **Status** | 🔵 Em Planejamento |
| **Responsável** | GitHub Copilot + Lucas Mancebo |
| **Dependências** | ✅ M1 + M2 Concluídas |

---

## 2. Escopo Geral

Esta milestone consolida o **núcleo de negócio** do sistema MACAEPREV, implementando a gestão completa de:
- **Servidores**: Cadastro e gestão de servidores públicos (estrutura já scaffolded)
- **Consignatárias**: Instituições credoras de consignação
- **Produtos**: Tipos de empréstimo/consignação
- **Margens**: Regras de desconto e taxas
- **Consignações**: Solicitações e acompanhamento (novo módulo)

---

## 3. POCs Cobertas Nesta Milestone

| POC | Descrição | Componentes |
|-----|-----------|-------------|
| **POC 3** | Produtos + averbação (valor/percentual) | Produto + Margem |
| **POC 4** | Inclusão de novas modalidades | Producto (tipos) |
| **POC 5** | Controle de margens exclusivas/compartilhadas | Margens (regras) |
| **POC 7** | Controle de margem com base na folha | Cálculo + Validação |
| **POC 8** | Registro ágil de contratos + conciliação | Consignação + Parcelas |
| **POC 9** | Portabilidade e renegociação | Consignação (fluxos) |
| **POC 11** | Controle de CET máximo | Validação (taxa) |
| **POC 20** | Módulo de portabilidade/renegociação | Workflow (novo) |

**Total POCs a Responder: 8 (de 30 globais)** → Completará 17/30 (57%)

---

## 4. Arquitetura de Dados — Entidades Principais

### 4.1 Servidor (✅ Já Scaffolded)
```typescript
model Servidor {
  id: String (PK)
  nome: String
  cpf: String (unique, validado)
  matricula: String (unique)
  cargo: String
  situacao_funcional: String
  data_admissao: DateTime
  remuneracao_bruta: Decimal
  status: String ("ATIVO" | "INATIVO" | "LICENCA")
  
  // Relações
  consignacoes: Consignacao[]
  margens_servidor: MargemServidor[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4.2 Consignataria (✅ Já Scaffolded)
```typescript
model Consignataria {
  id: String (PK)
  nome: String (unique)
  cnpj: String (unique, validado)
  endereco: String
  telefone: String
  email: String (unique)
  status: String ("ATIVA" | "INATIVA" | "SUSPENSA")
  
  // Relações
  produtos: Produto[]
  consignacoes: Consignacao[]
  margens: Margem[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4.3 Produto (⚠️ Parcialmente Scaffolded)
```typescript
model Produto {
  id: String (PK)
  codigo: String (unique)
  nome: String
  tipo: String ("EMPRESTIMO" | "FINANCIAMENTO" | "CONSIGNACAO")
  descricao: String
  taxa_minima: Decimal (%)
  taxa_maxima: Decimal (%)
  prazo_minimo: Int (meses)
  prazo_maximo: Int (meses)
  status: String ("ATIVO" | "INATIVO")
  
  // Relações
  consignataria_id: String (FK)
  margens: Margem[]
  consignacoes: Consignacao[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4.4 Margem (📝 Requer Ajustes)
```typescript
model Margem {
  id: String (PK)
  produto_id: String (FK)
  consignataria_id: String (FK)
  tipo: String ("EXCLUSIVA" | "COMPARTILHADA")
  percentual: Decimal (%)
  valor_limite: Decimal
  valor_disponivel: Decimal
  prazo_desconto: Int (meses)
  status: String ("ATIVA" | "SUSPENSA" | "BLOQUEADA")
  
  // Relações
  consignacoes: Consignacao[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4.5 Consignação (🆕 Novo Módulo)
```typescript
model Consignacao {
  id: String (PK)
  servidor_id: String (FK)
  produto_id: String (FK)
  consignataria_id: String (FK)
  margem_id: String (FK)
  
  // Dados Financeiros
  valor_solicitado: Decimal
  valor_aprovado: Decimal
  taxa_aplicada: Decimal (%)
  cet_percentual: Decimal (%)
  
  // Prazos
  quantidade_parcelas: Int
  data_solicitacao: DateTime
  data_aprovacao: DateTime
  data_inicio_desconto: DateTime
  data_termino_previsto: DateTime
  
  // Status & Fluxo
  status: String ("SOLICITADA" | "APROVADA" | "ATIVA" | "QUITADA" | "CANCELADA" | "PORTADA")
  motivo_rejeicao: String
  
  // Auditoria
  usuario_criacao_id: String (FK)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relações
  parcelas: Parcela[]
  portabilidades: Portabilidade[]
}
```

### 4.6 Parcela (📝 Novo)
```typescript
model Parcela {
  id: String (PK)
  consignacao_id: String (FK)
  numero: Int
  data_vencimento: DateTime
  valor_bruto: Decimal
  valor_desconto: Decimal
  valor_liquido: Decimal
  status: String ("PENDENTE" | "PAGA" | "ATRASO" | "CANCELADA")
  data_pagamento: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4.7 Portabilidade (📝 Novo)
```typescript
model Portabilidade {
  id: String (PK)
  consignacao_original_id: String (FK)
  consignacao_nova_id: String (FK)
  consignataria_origem_id: String (FK)
  consignataria_destino_id: String (FK)
  
  data_solicitacao: DateTime
  data_aprovacao: DateTime
  data_efetivacao: DateTime
  
  motivo: String
  status: String ("SOLICITADA" | "APROVADA" | "EFETIVADA" | "CANCELADA")
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 5. Estrutura de Diretórios — Backend

```
api/src/modules/
├── servidores/
│   ├── __tests__/
│   │   ├── servidores.service.spec.ts (novo)
│   │   └── servidores.validation.spec.ts (novo)
│   ├── servidores.controller.ts (✅ existe)
│   ├── servidores.service.ts (✅ existe, melhorias)
│   ├── servidores.routes.ts (✅ existe)
│   └── servidores.validation.ts (novo)
│
├── consignatarias/
│   ├── __tests__/
│   │   ├── consignatarias.service.spec.ts (novo)
│   │   └── consignatarias.validation.spec.ts (novo)
│   ├── consignatarias.controller.ts (✅ existe)
│   ├── consignatarias.service.ts (✅ existe, melhorias)
│   ├── consignatarias.routes.ts (✅ existe)
│   └── consignatarias.validation.ts (novo)
│
├── produtos/
│   ├── __tests__/
│   │   ├── produtos.e2e.test.ts (novo)
│   │   └── produtos.service.spec.ts (novo)
│   ├── produtos.controller.ts (novo)
│   ├── produtos.service.ts (novo)
│   ├── produtos.routes.ts (novo)
│   └── produtos.validation.ts (novo)
│
├── margens/
│   ├── __tests__/
│   │   ├── margens.e2e.test.ts (novo)
│   │   └── margens.service.spec.ts (novo)
│   ├── margens.controller.ts (novo)
│   ├── margens.service.ts (novo)
│   ├── margens.routes.ts (novo)
│   └── margens.validation.ts (novo)
│
└── consignacoes/
    ├── __tests__/
    │   ├── consignacoes.e2e.test.ts (novo)
    │   ├── consignacoes.service.spec.ts (novo)
    │   └── consignacoes.workflow.spec.ts (novo)
    ├── consignacoes.controller.ts (novo)
    ├── consignacoes.service.ts (novo)
    ├── consignacoes.routes.ts (novo)
    ├── consignacoes.validation.ts (novo)
    └── consignacoes.workflow.ts (novo — máquina de estado)
```

---

## 6. Funcionalidades Principais por Módulo

### 6.1 Servidores (M3.1 — Ajustes)
**Status**: Scaffolded, precisa validações
- [x] Listar servidores (com filtros: status, cargo)
- [x] Buscar por ID
- [x] Criar servidor
- [x] Atualizar servidor
- [x] Deletar servidor (soft delete)
- [ ] **Validação de CPF** (matemática + duplicação)
- [ ] **Validação de Matrícula** (duplicação)
- [ ] **Auditoria de mudanças** (já integrada)
- [ ] **Testes E2E** (ajustar autenticação)

### 6.2 Consignatárias (M3.1 — Ajustes)
**Status**: Scaffolded, precisa validações
- [x] Listar consignatárias
- [x] Buscar por ID
- [x] Criar consignatária
- [x] Atualizar consignatária
- [x] Deletar consignatária (soft delete)
- [ ] **Validação de CNPJ** (matemática + duplicação)
- [ ] **Validação de Email** (único)
- [ ] **Auditoria completa**
- [ ] **Testes E2E** (ajustar autenticação)

### 6.3 Produtos (M3.2 — Novo)
**Status**: Schemas prontos, código não
- [ ] CRUD completo
- [ ] Validação de tipos (ENUM)
- [ ] Validação de taxas (min ≤ max)
- [ ] Filtro por consignatária
- [ ] Testes E2E (6+ casos)

### 6.4 Margens (M3.2 — Novo)
**Status**: Schemas prontos, código não
- [ ] CRUD para margens por produto/consignatária
- [ ] Validação de tipo (EXCLUSIVA vs COMPARTILHADA)
- [ ] Cálculo de disponibilidade (utilizado vs limite)
- [ ] Bloqueio/desbloqueio de margens
- [ ] Testes E2E (8+ casos)

### 6.5 Consignações (M3.3 — Novo Módulo Completo)
**Status**: Schemas prontos, lógica não
- [ ] Fluxo de solicitação → aprovação → ativa
- [ ] Validação de elegibilidade do servidor
- [ ] Cálculo de CET (Custo Efetivo Total)
- [ ] Geração de parcelas
- [ ] Portabilidade entre consignatárias
- [ ] Quitação antecipada
- [ ] Renegociação de termos
- [ ] Testes E2E (12+ casos)

---

## 7. Regras de Negócio Críticas

### 7.1 Validações de Entrada
- **CPF**: Algoritmo módulo 11 (RFC 3962 ou similar)
- **CNPJ**: Algoritmo de validação oficial
- **Taxa de Juros**: Mínimo 1%, máximo legal (taxa de mercado)
- **CET**: Cálculo conforme regulação BC (Lei 8.078/90)
- **Prazo**: Mínimo 6 meses, máximo 240 meses

### 7.2 Regras de Consignação
- Servidor deve estar **ATIVO** para nova consignação
- Margem deve ter saldo disponível ≥ valor solicitado
- Número de parcelas deve estar entre prazo_minimo e prazo_maximo do produto
- Data de término não pode exceder data de aposentadoria (se aplicável)

### 7.3 Portabilidade
- Só é permitida para consignações **ATIVAS** ou **QUITADAS**
- Consignatária destino deve ter margem disponível
- Taxa da consignatária destino não pode ser > 10% da origem (proteção)

### 7.4 Auditoria
- Todas as mudanças de status registradas em `LogAuditoria`
- IP, User-Agent, usuário, timestamp em cada alteração
- Snapshots de valores antes/depois

---

## 8. Endpoints Planejados

### Servidores
```
GET    /v1/servidores
GET    /v1/servidores/:id
POST   /v1/servidores
PUT    /v1/servidores/:id
DELETE /v1/servidores/:id
```

### Consignatárias
```
GET    /v1/consignatarias
GET    /v1/consignatarias/:id
POST   /v1/consignatarias
PUT    /v1/consignatarias/:id
DELETE /v1/consignatarias/:id
```

### Produtos
```
GET    /v1/produtos
GET    /v1/produtos/:id
POST   /v1/produtos
PUT    /v1/produtos/:id
DELETE /v1/produtos/:id
GET    /v1/consignatarias/:id/produtos
```

### Margens
```
GET    /v1/margens
GET    /v1/margens/:id
POST   /v1/margens
PUT    /v1/margens/:id
DELETE /v1/margens/:id
GET    /v1/margens/produto/:produtoId
GET    /v1/margens/disponibilidade/:margemId
```

### Consignações
```
GET    /v1/consignacoes
GET    /v1/consignacoes/:id
POST   /v1/consignacoes (solicitação)
PUT    /v1/consignacoes/:id/aprovar
PUT    /v1/consignacoes/:id/cancelar
PUT    /v1/consignacoes/:id/quitar
GET    /v1/consignacoes/:id/parcelas
POST   /v1/consignacoes/:id/portabilidade
```

---

## 9. Matriz de Testes (Escopo)

### Testes Unitários
- Validações (CPF, CNPJ, taxa, prazo)
- Cálculos (CET, disponibilidade, parcelas)
- Regras de negócio (elegibilidade)

### Testes E2E
- Fluxos completos de CRUD
- Fluxos de consignação (solicit → aprova → ativa → quitação)
- Portabilidades
- Testes de autorização (Admin vs Servidor)

**Target**: 50+ testes E2E, 100% pass rate com `npm run test:local-db`

---

## 10. Estimativas de Esforço

| Componente | Estimado | Complexidade |
|-----------|----------|--------------|
| **M3.1 — Servidores/Consignatárias (validações)** | 1-2 dias | 🟡 Média |
| **M3.2 — Produtos/Margens (CRUD novo)** | 1-2 dias | 🟡 Média |
| **M3.3 — Consignações (lógica complexa)** | 2-3 dias | 🔴 Alta |
| **M3.4 — Testes + Documentação** | 1-2 dias | 🟡 Média |
| **TOTAL M3** | **5-9 dias** | |

---

## 11. Próximas Etapas

1. ✅ **Documentação concluída** (este arquivo)
2. ⏳ **Criar schemas Prisma** (migrations para novos modelos)
3. ⏳ **Implementar validações** (M3.1)
4. ⏳ **CRUD Produtos/Margens** (M3.2)
5. ⏳ **Lógica Consignações** (M3.3)
6. ⏳ **Testes E2E** (M3.4)
7. ⏳ **Documentação Final** (entrega.md, evidencias.md, validacao.md)

---

## 12. Dependências Externas

- **Validador CPF**: Algoritmo RFC-padrão (JS: `cpf-validator` ou custom)
- **Validador CNPJ**: Algoritmo oficial Receita Federal
- **Cálculo CET**: Conforme Banco Central (Lei 8.078/90)
- **Mascara de dados**: Para logs (PII masking)

---

**Status**: 🔵 Planejamento Concluído — Pronto para Desenvolvimento

Next: Executar **Opção A — Testes & Validações**
