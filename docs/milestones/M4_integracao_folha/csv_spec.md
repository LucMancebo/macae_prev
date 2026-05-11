# Especificação de Formato CSV — Folha de Pagamento MACAEPREV

**Versão:** 1.0  
**Data:** 11/05/2026  
**Status:** Alinhado ao parser/service atual da API

---

## 📋 Visão Geral

Documento define o formato exato de arquivos CSV utilizados na integração entre o sistema de consignação MACAEPREV e o sistema de folha de pagamento. Cobre:

1. **Entrada (Folha MACAEPREV)**: Arquivo com consignações a processar
2. **Saída (Retorno)**: Arquivo com resultado de processamento de folha
3. **Formato Legado**: Estrutura esperada do banco de dados histórico para migração

> A ordem das colunas descrita abaixo é a ordem usada pelo parser atual em `api/src/utils/csv-parser.ts`.

---

## 1️⃣ Arquivo de Entrada — Folha de Consignações (ENTRADA)

### 1.1 Nome do Arquivo

```
FOLHA_CONSIGNACOES_MACAEPREV_YYYYMM_HHmmss.csv
```

Exemplo: `FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv`

### 1.2 Encoding e Formato

- **Encoding**: UTF-8 com BOM (opcional, detectado automaticamente)
- **Delimiter**: `,` (vírgula)
- **Quote Character**: `"` (aspas duplas)
- **Line Ending**: CRLF (`\r\n`)
- **Max File Size**: 10 MB
- **Max Lines**: 100.000 linhas de dados (excluindo header)

### 1.3 Header (Linha 1)

```csv
consignante_id,consignataria_id,servidor_matricula,servidor_nome,produto_id,valor_liquido,desconto_consignante,taxa_efetiva,cet,parcela_numero,valor_parcela,data_vencimento,desconto_retencao,acrescimo_juros,observacoes
```

**Descrição de Colunas:**

| #   | Nome                 | Tipo    | Tamanho | Obrigatório | Exemplo                 | Validação                                          |
| --- | -------------------- | ------- | ------- | ----------- | ----------------------- | -------------------------------------------------- |
| 1   | consignante_id       | String  | 20      | ✅          | "MACAEPREV"             | Alfanumérico                                       |
| 2   | consignataria_id     | String  | 20      | ✅          | "B001"                  | Alfanumérico, FK em `Consignataria.codigo_externo` |
| 3   | servidor_matricula   | String  | 20      | ✅          | "MAT001"                | Alfanumérico, FK em `Servidor.matricula`           |
| 4   | servidor_nome        | String  | 200     | ✅          | "João Silva Santos"     | Letras, números, espaços, hífens                   |
| 5   | produto_id           | String  | 20      | ✅          | "PROD001"               | Alfanumérico, FK em `Produto.codigo_externo`       |
| 6   | valor_liquido        | Decimal | 12,2    | ✅          | "5000.00"               | Decimal > 0, max 999.999.999,99                    |
| 7   | desconto_consignante | Decimal | 10,2    | ❌          | "0.00" ou "250.00"      | Decimal ≥ 0, ≤ valor_liquido                       |
| 8   | taxa_efetiva         | Decimal | 6,4     | ✅          | "5.1234"                | Decimal > 0, validar contra CET máximo             |
| 9   | cet                  | Decimal | 6,4     | ✅          | "5.1234"                | Decimal > 0, ≤ CET máximo da consignatária         |
| 10  | parcela_numero       | Integer | 5       | ✅          | "1"                     | Integer 1-999                                      |
| 11  | valor_parcela        | Decimal | 12,2    | ✅          | "450.00"                | Decimal > 0, somar parcelas ≈ valor_liquido        |
| 12  | data_vencimento      | Date    | 10      | ✅          | "2026-06-15"            | Formato ISO 8601 (YYYY-MM-DD), futuro              |
| 13  | desconto_retencao    | Decimal | 10,2    | ❌          | "0.00"                  | Decimal ≥ 0 (imposto retido)                       |
| 14  | acrescimo_juros      | Decimal | 10,2    | ❌          | "15.00"                 | Decimal ≥ 0 (juros ou correção)                    |
| 15  | observacoes          | String  | 500     | ❌          | "Portabilidade de XXXX" | Texto livre                                        |

### 1.4 Linhas de Dados (Linha 2+)

```csv
MACAEPREV,B001,MAT001,João Silva,PROD001,5000.00,0.00,5.1234,5.1234,1,450.00,2026-06-15,0.00,0.00,
MACAEPREV,B001,MAT001,João Silva,PROD001,5000.00,0.00,5.1234,5.1234,2,450.00,2026-07-15,0.00,0.00,
MACAEPREV,B002,MAT002,Maria Santos,PROD002,3500.00,100.00,4.5000,4.5000,1,350.00,2026-06-15,25.00,0.00,Portabilidade
```

### 1.5 Validações de Entrada

**Por Linha:**

- Todos os campos obrigatórios preenchidos
- Tipos de dados corretos
- Decimal com máximo 2 casas decimais (exceto taxa: 4 casas)
- Datas futuras ou iguais a hoje
- IDs (consignataria_id, produto_id, servidor_matricula) existem no BD
- CET ≤ CET máximo da consignatária
- Taxa ≤ Taxa máxima do produto
- Valor parcela com coerência matemática

**Por Arquivo:**

- Checksum MD5 ou SHA256 (opcional, se informado)
- Não há linhas duplicadas (mesmo servidor + consignatária + parcela_numero)
- Total de linhas < 100.000
- Tamanho < 10 MB
- Encoding UTF-8 válido

---

## 2️⃣ Arquivo de Retorno — Resultado de Processamento (SAÍDA)

### 2.1 Nome do Arquivo

```
FOLHA_RETORNO_MACAEPREV_YYYYMM_HHmmss.csv
```

Exemplo: `FOLHA_RETORNO_MACAEPREV_202605_140245.csv`

### 2.2 Header (Linha 1)

```csv
arquivo_id,consignante_id,consignataria_id,servidor_matricula,parcela_id,status_processamento,valor_conciliado,motivo_nao_processamento,data_processamento
```

**Descrição de Colunas:**

| #   | Nome                     | Tipo     | Tamanho | Descrição                                               |
| --- | ------------------------ | -------- | ------- | ------------------------------------------------------- |
| 1   | arquivo_id               | UUID     | 36      | ID interno do arquivo processado                        |
| 2   | consignante_id           | String   | 20      | "MACAEPREV"                                             |
| 3   | consignataria_id         | String   | 20      | ID da consignatária (ex: "B001")                        |
| 4   | servidor_matricula       | String   | 20      | Matrícula do servidor                                   |
| 5   | parcela_id               | UUID     | 36      | ID interno da parcela                                   |
| 6   | status_processamento     | Enum     | -       | CONCILIADA, PENDENTE, ERRO_FK, ERRO_VALOR, ERRO_ARQUIVO |
| 7   | valor_conciliado         | Decimal  | 12,2    | Valor efetivamente processado                           |
| 8   | motivo_nao_processamento | String   | 500     | Descrição do erro (se status ≠ CONCILIADA)              |
| 9   | data_processamento       | DateTime | -       | Timestamp ISO 8601 de processamento                     |

### 2.3 Exemplo de Saída

```csv
arquivo_id,consignante_id,consignataria_id,servidor_matricula,parcela_id,status_processamento,valor_conciliado,motivo_nao_processamento,data_processamento
3fa85f64-5717-4562-b3fc-2c963f66afa6,MACAEPREV,B001,MAT001,550e8400-e29b-41d4-a716-446655440000,CONCILIADA,450.00,,2026-05-11T14:02:45Z
3fa85f64-5717-4562-b3fc-2c963f66afa6,MACAEPREV,B001,MAT001,550e8400-e29b-41d4-a716-446655440001,CONCILIADA,450.00,,2026-05-11T14:02:46Z
3fa85f64-5717-4562-b3fc-2c963f66afa6,MACAEPREV,B002,MAT003,550e8400-e29b-41d4-a716-446655440002,PENDENTE,0.00,Servidor sem margem disponível,2026-05-11T14:02:46Z
```

---

## 3️⃣ Arquivo Legado — Formato de Migração (LEGACY)

Para migração do banco MACAEPREV antigo, esperamos um formato SQL dump ou CSV com tabela consolidada de consignações históricas.

### 3.1 Schema SQL Legacy (esperado)

```sql
CREATE TABLE consignacoes_legado (
  id_externo VARCHAR(30) PRIMARY KEY,
  cpf_servidor VARCHAR(11) NOT NULL,
  nome_servidor VARCHAR(200) NOT NULL,
  matricula_servidor VARCHAR(20) NOT NULL,
  cnpj_consignataria VARCHAR(14) NOT NULL,
  razao_social_consignataria VARCHAR(200) NOT NULL,
  produto_nome VARCHAR(100) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  valor_parcela DECIMAL(12,2) NOT NULL,
  quantidade_parcelas INT NOT NULL,
  parcelas_pagas INT NOT NULL,
  taxa_juros DECIMAL(6,4) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status VARCHAR(30) NOT NULL,
  data_criacao DATETIME NOT NULL,
  data_ultima_atualizacao DATETIME NOT NULL
);
```

### 3.2 CSV Legacy Esperado

```csv
id_externo,cpf_servidor,nome_servidor,matricula_servidor,cnpj_consignataria,razao_social_consignataria,produto_nome,valor_total,valor_parcela,quantidade_parcelas,parcelas_pagas,taxa_juros,data_inicio,data_fim,status,data_criacao,data_ultima_atualizacao
CONS-2024-001,12345678901,João Silva,MAT001,12345678000101,Banco ABC S.A.,Empréstimo,15000.00,450.00,48,12,5.1234,2024-01-15,,ATIVO,2024-01-15 08:00:00,2026-05-11 10:00:00
CONS-2024-002,98765432109,Maria Santos,MAT002,98765432000101,Banco XYZ S.A.,Crédito,8000.00,350.00,24,0,4.5000,2026-05-15,,NOVO,2026-05-11 09:00:00,2026-05-11 09:00:00
```

---

## 🔐 Segurança

- ✅ Validação de encoding (UTF-8, BOM detection)
- ✅ Checksum MD5/SHA256 para detectar duplicação
- ✅ Rate-limiting: 5 uploads/hora por usuário
- ✅ Bloqueio de re-processamento de arquivo duplicado
- ✅ Backup automático antes de processamento
- ✅ Auditoria em LogAuditoria (IP, usuário, timestamp, arquivo_id)
- ✅ Permissão: ADMINISTRADOR only para import

---

## 📊 Exemplos de Teste

### Teste Unitário: Validação de Header

```typescript
const validCSV = `consignante_id,consignataria_id,servidor_matricula,...`;
const invalidCSV = `consignante_id,servidor_matricula`; // falta colunas

expect(validateHeader(validCSV, requiredColumns)).toBe(true);
expect(validateHeader(invalidCSV, requiredColumns)).toBe(false);
```

### Teste Unitário: Detecção de BOM

```typescript
const csvWithBOM = Buffer.from("\uFEFFconsignante_id,...");
const parsed = parseCSV(csvWithBOM);
expect(parsed.encoding).toBe("utf-8-bom");
expect(parsed.lines[0][0]).toBe("consignante_id"); // BOM removido
```

### Teste Unitário: Validação de CET

```typescript
const line = { cet: 7.0, consignataria_id: "B001" };
const consignataria = { cet_maximo: 6.0 };

expect(validateCET(line.cet, consignataria.cet_maximo)).toBe(false);
```

---

## 📝 Checklist de Implementação

- [ ] Parser CSV com detectores de encoding (UTF-8, ISO-8859-1, CP-1252)
- [ ] Validador de header (colunas obrigatórias)
- [ ] Validador de tipos de dados (decimal, date, enum)
- [ ] Validador de FK (consignataria_id, produto_id, servidor_matricula)
- [ ] Gerador de arquivo de retorno (com status_processamento)
- [ ] Checksum utilities (MD5, SHA256)
- [ ] BOM detection e remoção automática
- [ ] Suporte a delimiters alternativos (TSV, pipe)
- [ ] Testes: 8+ casos de validação + erro handling
- [ ] Documentação em OpenAPI
- [ ] Script de migração legado (SQL → CSV → Prisma)
