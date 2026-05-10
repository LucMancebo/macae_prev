# Especificação Técnica — Arquitetura M3

## 1. Diagrama ER (Entity-Relationship)

```
Servidor (1) ──────────── (N) Consignacao
  |                             |
  |                             |
  └─────── (N) MargemServidor ──┘

Consignataria (1) ─────────── (N) Produto
       |                            |
       |                            |
       └──────── (N) Margem ────────┘
                   |
                   └── (N) Consignacao

Consignacao (1) ──────────────── (N) Parcela
       |
       └────── (N) Portabilidade

Usuario (1) ──────────── (N) Consignacao (usuario_criacao)
```

---

## 2. Fluxo de Estados — Consignação

```
┌─────────────┐
│ SOLICITADA  │ ← Criada pelo sistema ou servidor (via admin)
└──────┬──────┘
       │ (aprovação ou rejeição)
       ├─→ ❌ CANCELADA (rejeitada)
       │
       └─→ ✅ APROVADA
           └──────┬──────────────────┐
                  │                  │
                  ▼                  ▼
             ATIVA          PORTADA (novo contrato em outra consignatária)
             (desconto      └──────┬─────────────┘
              iniciado)            │
                  │                │
                  └────────┬───────┘
                           │
                           ▼
                      QUITADA
```

---

## 3. Implementação de Validadores

### 3.1 CPF Validator
```typescript
// utils/validators.ts
export function validarCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  
  // Algoritmo módulo 11 (RFC padrão)
  const calcDigit = (str: string, factor: number): string => {
    let sum = 0;
    let multiplier = factor;
    for (const digit of str) {
      sum += parseInt(digit) * multiplier;
      multiplier--;
    }
    const remainder = (sum % 11);
    return (remainder < 2) ? '0' : String(11 - remainder);
  };
  
  const digit1 = calcDigit(clean.substring(0, 9), 10);
  const digit2 = calcDigit(clean.substring(0, 9) + digit1, 11);
  
  return clean === clean.substring(0, 9) + digit1 + digit2;
}
```

### 3.2 CNPJ Validator
```typescript
export function validarCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  
  if (/^(\d)\1{13}$/.test(clean)) return false; // Todos dígitos iguais
  
  const calcDigit = (str: string, weights: number[]): string => {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += parseInt(str[i]) * weights[i];
    }
    const remainder = sum % 11;
    return (remainder < 2) ? '0' : String(11 - remainder);
  };
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit1 = calcDigit(clean.substring(0, 12), weights1);
  
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit2 = calcDigit(clean.substring(0, 12) + digit1, weights2);
  
  return clean === clean.substring(0, 12) + digit1 + digit2;
}
```

### 3.3 Taxa Validator
```typescript
export function validarTaxas(taxa_minima: number, taxa_maxima: number): boolean {
  // Taxa: 0.5% a 30% ao mês
  return taxa_minima >= 0.5 && taxa_maxima <= 30 && taxa_minima <= taxa_maxima;
}
```

### 3.4 Prazo Validator
```typescript
export function validarPrazo(prazo: number, min: number, max: number): boolean {
  return prazo >= min && prazo <= max && prazo > 0;
}
```

---

## 4. Cálculo de CET (Custo Efetivo Total)

**CET = Taxa Efetiva Anual equivalente a todos os custos do financiamento**

```typescript
// services/calculos.service.ts
export class CalculosService {
  /**
   * Calcula CET conforme Lei 8.078/90 (Código de Proteção ao Consumidor)
   * Fórmula: CET = ([(1 + TP)^12 - 1] × 100)%
   * TP = Taxa Periódica mensal (efetiva)
   */
  static calcularCET(
    taxa_mensal_percentual: number,
    custos_adicionais_percentual: number = 0
  ): number {
    const taxa_mensal = taxa_mensal_percentual / 100;
    const custos = custos_adicionais_percentual / 100;
    
    const taxa_efetiva = taxa_mensal + custos;
    const cet = (Math.pow(1 + taxa_efetiva, 12) - 1) * 100;
    
    return parseFloat(cet.toFixed(2));
  }

  /**
   * Calcula valor de parcelas mensais (Price Method)
   */
  static calcularParcelas(
    valor_principal: number,
    taxa_mensal_percentual: number,
    quantidade_parcelas: number
  ): { valor_parcela: number; valor_total: number; juros_total: number } {
    const taxa = taxa_mensal_percentual / 100;
    
    // Fórmula Price: P = V * (i * (1+i)^n) / ((1+i)^n - 1)
    const numerador = taxa * Math.pow(1 + taxa, quantidade_parcelas);
    const denominador = Math.pow(1 + taxa, quantidade_parcelas) - 1;
    const valor_parcela = valor_principal * (numerador / denominador);
    
    const valor_total = valor_parcela * quantidade_parcelas;
    const juros_total = valor_total - valor_principal;
    
    return {
      valor_parcela: parseFloat(valor_parcela.toFixed(2)),
      valor_total: parseFloat(valor_total.toFixed(2)),
      juros_total: parseFloat(juros_total.toFixed(2))
    };
  }

  /**
   * Calcula disponibilidade de margem
   */
  static calcularDisponibilidadeMaragem(
    valor_limite: number,
    valor_utilizado: number
  ): number {
    const disponivel = valor_limite - valor_utilizado;
    return disponivel < 0 ? 0 : parseFloat(disponivel.toFixed(2));
  }
}
```

---

## 5. Máquina de Estado — Consignação

```typescript
// consignacoes/consignacoes.workflow.ts

export enum ConsignacaoStatus {
  SOLICITADA = 'SOLICITADA',
  APROVADA = 'APROVADA',
  ATIVA = 'ATIVA',
  QUITADA = 'QUITADA',
  CANCELADA = 'CANCELADA',
  PORTADA = 'PORTADA'
}

export class ConsignacaoWorkflow {
  static canTransition(
    current: ConsignacaoStatus,
    next: ConsignacaoStatus
  ): boolean {
    const transitions: Record<ConsignacaoStatus, ConsignacaoStatus[]> = {
      SOLICITADA: [APROVADA, CANCELADA],
      APROVADA: [ATIVA, CANCELADA],
      ATIVA: [QUITADA, CANCELADA, PORTADA],
      QUITADA: [],
      CANCELADA: [],
      PORTADA: [ATIVA, QUITADA]
    };
    
    return transitions[current]?.includes(next) ?? false;
  }

  static getNextStates(current: ConsignacaoStatus): ConsignacaoStatus[] {
    const transitions: Record<ConsignacaoStatus, ConsignacaoStatus[]> = {
      SOLICITADA: [APROVADA, CANCELADA],
      APROVADA: [ATIVA, CANCELADA],
      ATIVA: [QUITADA, CANCELADA, PORTADA],
      QUITADA: [],
      CANCELADA: [],
      PORTADA: [ATIVA, QUITADA]
    };
    
    return transitions[current] ?? [];
  }
}
```

---

## 6. Schemas de Validação (Zod/Yup)

```typescript
// servidores/servidores.validation.ts
import { z } from 'zod';

export const createServidorSchema = z.object({
  nome: z.string().min(3).max(100),
  cpf: z.string().regex(/^\d{11}$/).refine(validarCPF, 'CPF inválido'),
  matricula: z.string().min(3).max(20),
  cargo: z.enum(['ANALISTA', 'TÉCNICO', 'ASSISTENTE', 'GESTOR']),
  situacao_funcional: z.enum(['ATIVO', 'LICENCA', 'INATIVO']),
  data_admissao: z.string().datetime(),
  remuneracao_bruta: z.number().positive(),
  status: z.enum(['ATIVO', 'INATIVO']).default('ATIVO')
});

export const updateServidorSchema = createServidorSchema.partial();

export type CreateServidorInput = z.infer<typeof createServidorSchema>;
export type UpdateServidorInput = z.infer<typeof updateServidorSchema>;
```

---

## 7. Arquitetura de Pastas (TypeScript Modules)

```
api/src/modules/
├── servidores/
│   ├── __tests__/
│   │   └── servidores.*.spec.ts
│   ├── servidores.controller.ts
│   ├── servidores.service.ts
│   ├── servidores.routes.ts
│   └── servidores.validation.ts (novo)
│
├── consignatarias/
│   ├── __tests__/
│   │   └── consignatarias.*.spec.ts
│   ├── consignatarias.controller.ts
│   ├── consignatarias.service.ts
│   ├── consignatarias.routes.ts
│   └── consignatarias.validation.ts (novo)
│
├── produtos/
│   ├── __tests__/
│   │   ├── produtos.e2e.test.ts
│   │   └── produtos.service.spec.ts
│   ├── produtos.controller.ts
│   ├── produtos.service.ts
│   ├── produtos.routes.ts
│   └── produtos.validation.ts
│
├── margens/
│   ├── __tests__/
│   │   ├── margens.e2e.test.ts
│   │   └── margens.service.spec.ts
│   ├── margens.controller.ts
│   ├── margens.service.ts
│   ├── margens.routes.ts
│   └── margens.validation.ts
│
└── consignacoes/
    ├── __tests__/
    │   ├── consignacoes.e2e.test.ts
    │   ├── consignacoes.service.spec.ts
    │   └── consignacoes.workflow.spec.ts
    ├── consignacoes.controller.ts
    ├── consignacoes.service.ts
    ├── consignacoes.routes.ts
    ├── consignacoes.validation.ts
    └── consignacoes.workflow.ts

utils/
├── validators.ts (CPF, CNPJ, etc)
├── calculos.ts (CET, parcelas, margens)
└── masking.ts (PII masking para logs)
```

---

## 8. Dependencies & Packages Necessários

```json
{
  "dependencies": {
    "zod": "^3.22.0",
    "decimal.js": "^10.4.0"
  },
  "devDependencies": {
    "jest": "^30.0.0",
    "supertest": "^6.3.0"
  }
}
```

**Nota**: Já instalados em M1/M2. Sem novos pacotes críticos.

---

## 9. Fluxos de Integração (Diagrama)

```
Frontend (Next.js)
    │
    ├─→ POST /v1/servidores (admin cria novo servidor)
    ├─→ GET /v1/produtos (listar disponíveis)
    ├─→ POST /v1/consignacoes (servidor solicita)
    ├─→ PUT /v1/consignacoes/:id/aprovar (admin aprova)
    └─→ GET /v1/consignacoes/:id/parcelas (servidor consulta parcelas)

Backend (Fastify + Prisma)
    ├─ Validação de entrada (Zod)
    ├─ Verificação de autorização (JWT + Perfil)
    ├─ Cálculos de negócio (CET, margens, parcelas)
    ├─ Registro em auditoria (LogAuditoria)
    └─ Persisten em banco (Prisma)

Database (PostgreSQL)
    ├─ Servidor, Consignataria, Produto, Margem
    ├─ Consignacao, Parcela, Portabilidade
    └─ LogAuditoria (todas as mudanças)
```

---

**Status**: 🔵 Especificação Técnica Completa — Pronto para Implementação

Next: **Opção A — Testes & Validações (M3.1)**
