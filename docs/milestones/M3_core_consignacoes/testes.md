# Plano de Testes — Milestone 3

## 1. Resumo

**Target**: 50+ casos de teste E2E com 100% pass rate
**Estratégia**: Testes unitários (validações) + E2E (fluxos)
**Runner**: `npm run test:local-db` (Docker PostgreSQL)

---

## 2. Testes Unitários — Validadores

| ID | Descrição | Esperado | Status |
|----|-----------|----------|--------|
| UT01 | CPF válido (52998224725) | Pass | ⏳ TODO |
| UT02 | CPF inválido (11111111111) | Fail | ⏳ TODO |
| UT03 | CPF formato inválido | Fail | ⏳ TODO |
| UT04 | CNPJ válido | Pass | ⏳ TODO |
| UT05 | CNPJ inválido | Fail | ⏳ TODO |
| UT06 | Taxa válida (1-30%) | Pass | ⏳ TODO |
| UT07 | Taxa fora do intervalo | Fail | ⏳ TODO |
| UT08 | Prazo válido (6-240 meses) | Pass | ⏳ TODO |
| UT09 | Prazo inválido | Fail | ⏳ TODO |
| UT10 | CET calculado corretamente | Valor numérico > 0 | ⏳ TODO |

---

## 3. Testes Unitários — Cálculos

| ID | Descrição | Entrada | Esperado | Status |
|----|-----------|---------|----------|--------|
| UC01 | Cálculo parcelas (Price) | 10000, 1%, 12 meses | ~840 por parcela | ⏳ TODO |
| UC02 | CET (taxa 1% + custos 0.5%) | 1%, 0.5% | ~11.4% aa | ⏳ TODO |
| UC03 | Disponibilidade (10000 - 3000) | Limite 10k, usado 3k | 7000 | ⏳ TODO |
| UC04 | Parcelas com taxa zero | 5000, 0%, 5 meses | 1000 | ⏳ TODO |

---

## 4. Testes E2E — Servidores (M3.1)

| ID | Cenário | Passos | Esperado | Status |
|----|---------|--------|----------|--------|
| E2E-SRV-01 | Listar servidores vazio | GET /v1/servidores | 200, [] | ⏳ TODO |
| E2E-SRV-02 | Criar servidor válido | POST /v1/servidores (dados válidos) | 201 + ID | ⏳ TODO |
| E2E-SRV-03 | Criar servidor CPF duplicado | POST /v1/servidores (CPF existente) | 409 (Conflict) | ⏳ TODO |
| E2E-SRV-04 | Criar servidor CPF inválido | POST /v1/servidores (CPF 11111111111) | 400 (Bad Request) | ⏳ TODO |
| E2E-SRV-05 | Buscar servidor por ID | GET /v1/servidores/:id | 200 + dados | ⏳ TODO |
| E2E-SRV-06 | Buscar servidor inexistente | GET /v1/servidores/fake-id | 404 | ⏳ TODO |
| E2E-SRV-07 | Atualizar servidor (nome) | PUT /v1/servidores/:id (novo nome) | 200 + atualizado | ⏳ TODO |
| E2E-SRV-08 | Deletar servidor | DELETE /v1/servidores/:id | 200 (soft delete) | ⏳ TODO |
| E2E-SRV-09 | Filtrar por status ATIVO | GET /v1/servidores?status=ATIVO | 200 + filtered | ⏳ TODO |
| E2E-SRV-10 | Filtrar por cargo | GET /v1/servidores?cargo=ANALISTA | 200 + filtered | ⏳ TODO |

---

## 5. Testes E2E — Consignatárias (M3.1)

| ID | Cenário | Passos | Esperado | Status |
|----|---------|--------|----------|--------|
| E2E-CONS-01 | Listar consignatárias | GET /v1/consignatarias | 200 | ⏳ TODO |
| E2E-CONS-02 | Criar consignatária válida | POST /v1/consignatarias (dados válidos) | 201 + ID | ⏳ TODO |
| E2E-CONS-03 | CNPJ duplicado | POST /v1/consignatarias (CNPJ existente) | 409 | ⏳ TODO |
| E2E-CONS-04 | Email duplicado | POST /v1/consignatarias (email existente) | 409 | ⏳ TODO |
| E2E-CONS-05 | CNPJ inválido | POST /v1/consignatarias (CNPJ 00000000000000) | 400 | ⏳ TODO |
| E2E-CONS-06 | Buscar por ID | GET /v1/consignatarias/:id | 200 + dados | ⏳ TODO |
| E2E-CONS-07 | Atualizar status | PUT /v1/consignatarias/:id (SUSPENSA) | 200 + atualizado | ⏳ TODO |
| E2E-CONS-08 | Deletar consignatária | DELETE /v1/consignatarias/:id | 200 (soft delete) | ⏳ TODO |

---

## 6. Testes E2E — Produtos (M3.2)

| ID | Cenário | Passos | Esperado | Status |
|----|---------|--------|----------|--------|
| E2E-PROD-01 | Listar produtos | GET /v1/produtos | 200 + lista | ⏳ TODO |
| E2E-PROD-02 | Criar produto válido | POST /v1/produtos (tipo EMPRESTIMO) | 201 + ID | ⏳ TODO |
| E2E-PROD-03 | Taxa mínima > taxa máxima | POST /v1/produtos (min 30%, max 1%) | 400 | ⏳ TODO |
| E2E-PROD-04 | Prazo fora do intervalo | POST /v1/produtos (prazo 500 meses) | 400 | ⏳ TODO |
| E2E-PROD-05 | Listar por consignatária | GET /v1/consignatarias/:id/produtos | 200 + filtered | ⏳ TODO |
| E2E-PROD-06 | Atualizar produto | PUT /v1/produtos/:id | 200 + atualizado | ⏳ TODO |

---

## 7. Testes E2E — Margens (M3.2)

| ID | Cenário | Passos | Esperado | Status |
|----|---------|--------|----------|--------|
| E2E-MARG-01 | Criar margem EXCLUSIVA | POST /v1/margens (tipo EXCLUSIVA) | 201 + ID | ⏳ TODO |
| E2E-MARG-02 | Criar margem COMPARTILHADA | POST /v1/margens (tipo COMPARTILHADA) | 201 + ID | ⏳ TODO |
| E2E-MARG-03 | Consultar disponibilidade | GET /v1/margens/:id/disponibilidade | 200 + valor | ⏳ TODO |
| E2E-MARG-04 | Bloquear margem | PUT /v1/margens/:id (status BLOQUEADA) | 200 | ⏳ TODO |
| E2E-MARG-05 | Listar por produto | GET /v1/margens/produto/:produtoId | 200 + filtered | ⏳ TODO |
| E2E-MARG-06 | Superar limite | POST /v1/margens (valor > limite) | 400 | ⏳ TODO |

---

## 8. Testes E2E — Consignações (M3.3 — Fluxos Complexos)

### Fluxo Principal: Solicitação → Aprovação → Ativa → Quitação

| ID | Cenário | Ações | Esperado | Status |
|----|---------|-------|----------|--------|
| E2E-CSN-01 | Criar consignação válida | POST /v1/consignacoes | 201 + status SOLICITADA | ⏳ TODO |
| E2E-CSN-02 | Servidor inexistente | POST (servidor_id invalid) | 400 | ⏳ TODO |
| E2E-CSN-03 | Margem insuficiente | POST (valor > disponível) | 400 | ⏳ TODO |
| E2E-CSN-04 | Aprovar consignação | PUT /v1/consignacoes/:id/aprovar | 200 + APROVADA | ⏳ TODO |
| E2E-CSN-05 | Ativar desconto | PUT /v1/consignacoes/:id (ATIVA) | 200 + parcelas criadas | ⏳ TODO |
| E2E-CSN-06 | Gerar parcelas corretamente | GET /v1/consignacoes/:id/parcelas | 200 + 12 parcelas | ⏳ TODO |
| E2E-CSN-07 | Quitar consignação | PUT /v1/consignacoes/:id/quitar | 200 + QUITADA | ⏳ TODO |
| E2E-CSN-08 | Cancelar consignação | PUT /v1/consignacoes/:id/cancelar | 200 + CANCELADA | ⏳ TODO |
| E2E-CSN-09 | CET calculado corretamente | POST (verificar cet_percentual) | CET > taxa | ⏳ TODO |
| E2E-CSN-10 | Portabilidade para novo contrato | POST /v1/consignacoes/:id/portabilidade | 201 + PORTADA | ⏳ TODO |

### Fluxos de Erro

| ID | Cenário | Ações | Esperado | Status |
|----|---------|-------|----------|--------|
| E2E-CSN-E01 | Transição de estado inválida | PUT /v1/consignacoes/:id (QUITADA → ATIVA) | 409 | ⏳ TODO |
| E2E-CSN-E02 | Sem autorização | POST /v1/consignacoes (sem token) | 401 | ⏳ TODO |
| E2E-CSN-E03 | Perfil não Admin | PUT /v1/consignacoes/:id/aprovar (USER) | 403 | ⏳ TODO |

---

## 9. Testes de Auditoria

| ID | Cenário | Verificação | Esperado | Status |
|----|---------|-------------|----------|--------|
| AUD-01 | Log criação servidor | Buscar LogAuditoria | INCLUSAO registrado | ⏳ TODO |
| AUD-02 | Log atualização consignação | Buscar LogAuditoria | ALTERACAO com IP/User-Agent | ⏳ TODO |
| AUD-03 | Snapshot antes/depois | Comparar dados_antigos vs dados_novos | Diferenças capturadas | ⏳ TODO |

---

## 10. Testes de Autorização

| ID | Cenário | Ação | Papel | Esperado | Status |
|----|---------|------|-------|----------|--------|
| AUTH-01 | Criar servidor | POST | ADMIN | 201 | ⏳ TODO |
| AUTH-02 | Criar servidor | POST | USER | 403 | ⏳ TODO |
| AUTH-03 | Aprovar consignação | PUT/aprovar | ADMIN | 200 | ⏳ TODO |
| AUTH-04 | Aprovar consignação | PUT/aprovar | USER | 403 | ⏳ TODO |
| AUTH-05 | Listar próprias consignações | GET | USER | 200 + filtered | ⏳ TODO |

---

## 11. Resumo de Cobertura

```
Unitários: 14 casos
E2E Servidores: 10 casos
E2E Consignatárias: 8 casos
E2E Produtos: 6 casos
E2E Margens: 6 casos
E2E Consignações: 13 casos (fluxos + erros)
Auditoria: 3 casos
Autorização: 5 casos

TOTAL: 65+ casos de teste
```

**Meta**: 65/65 passando (100%) com `npm run test:local-db`

---

## 12. Próximas Etapas

1. ✅ **Documentação de testes definida**
2. ⏳ **Implementar validators**
3. ⏳ **Ajustar E2E Servidores/Consignatárias**
4. ⏳ **Criar CRUD Produtos/Margens com testes**
5. ⏳ **Implementar lógica Consignações**
6. ⏳ **Rodar suite completa**

---

**Status**: 🔵 Plano de Testes Completo — Pronto para Codificação

Next: **Opção A — Implementação & Testes (M3.1)**
