# M4: Especificação de Testes

**Cobertura Planejada:** 40+ testes | **Estado Atual:** backend validado; resultados executados registrados em [validacao.md](./validacao.md)

> Este documento descreve a estratégia e os casos previstos para M4. A execução real e os resultados consolidados estão em `validacao.md`.

---

## 📋 Testes Unitários (15 testes)

### csv-parser.test.ts (8 testes)

#### UT-CSV-001: Parser com CSV válido

```typescript
// Input: CSV bem-formado UTF-8
// Expected: ParseResult { linhas: 3, erros: [] }
// Validação: headers corretos + 3 data rows

test("parseCSV deve parsear arquivo válido", () => {
  const csv = `consignante_id,consignataria_id,matricula\n001,B001,MAT001\n002,B002,MAT002`;
  const result = parseCSV(csv, schemaHeader);
  expect(result.linhas).toBe(2);
  expect(result.erros.length).toBe(0);
});
```

#### UT-CSV-002: Parser detecta encoding UTF-8 com BOM

```typescript
// Input: UTF-8 com BOM (\uFEFF)
// Expected: BOM removido, parsing bem-sucedido

test("parseCSV deve detectar e remover BOM UTF-8", () => {
  const csv = "\uFEFFconsignante_id,consignataria_id\n001,B001";
  const result = parseCSV(csv, schemaHeader);
  expect(result.linhas).toBe(1);
  expect(result.erros.length).toBe(0);
});
```

#### UT-CSV-003: Parser detecta encoding ISO-8859-1

```typescript
// Input: CSV com caracteres Latin-1 (ç, ã)
// Expected: Detecção automática, parsing OK

test("parseCSV deve detectar ISO-8859-1", () => {
  const csv = Buffer.from("nome,valor\nJoão,100", "iso-8859-1");
  const result = parseCSV(csv, schemaHeader);
  expect(result.encoding).toBe("iso-8859-1");
});
```

#### UT-CSV-004: Parser valida delimiter (comma vs tab vs pipe)

```typescript
// Input: CSV com delimiter não-padrão (tab)
// Expected: Auto-detecta \t e parseia corretamente

test("parseCSV deve auto-detectar delimiter TSV", () => {
  const csv = "consignante_id\tconsignataria_id\n001\tB001";
  const result = parseCSV(csv, schemaHeader, { autoDelimiter: true });
  expect(result.delimiter).toBe("\t");
});
```

#### UT-CSV-005: Validador checksum MD5

```typescript
// Input: Buffer + MD5 esperado
// Expected: Match ✅ ou erro checksum mismatch

test("validarChecksum deve validar MD5", () => {
  const buffer = Buffer.from("teste");
  const md5 = hashMD5(buffer); // 098f6bcd4621d373cade4e832627b4f6
  expect(validarChecksum(buffer, md5, "md5")).toBe(true);
  expect(validarChecksum(buffer, "wronghash", "md5")).toBe(false);
});
```

#### UT-CSV-006: Validador checksum SHA256

```typescript
// Input: Buffer + SHA256 esperado
// Expected: Validação SHA256 completa

test("validarChecksum deve validar SHA256", () => {
  const buffer = Buffer.from("teste");
  const sha256 = hashSHA256(buffer);
  expect(validarChecksum(buffer, sha256, "sha256")).toBe(true);
});
```

#### UT-CSV-007: Validador tamanho de arquivo

```typescript
// Input: Buffer > 10MB
// Expected: Erro "Arquivo muito grande"

test("validarArquivo deve rejeitar arquivo > 10MB", () => {
  const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
  const result = validarArquivo(largeBuffer);
  expect(result.erro).toContain("Arquivo muito grande");
});
```

#### UT-CSV-008: Validador schema de header

```typescript
// Input: CSV com colunas faltando ou erradas
// Expected: Erro "Colunas obrigatórias faltando"

test("validarArquivo deve validar colunas obrigatórias", () => {
  const csv = "consignante_id,nome\n001,João"; // Falta consignataria_id
  const result = validarSchema(csv, requiredColumns);
  expect(result.erro).toContain("consignataria_id");
});
```

---

### validators.test.ts (4 testes)

#### UT-VAL-001: Validador valor decimal

```typescript
test("validarValor deve aceitar decimais válidos", () => {
  expect(validarValor(100.5)).toBe(true);
  expect(validarValor(0)).toBe(true);
  expect(validarValor(-50.25)).toBe(true);
  expect(validarValor("abc")).toBe(false);
});
```

#### UT-VAL-002: Validador data vencimento

```typescript
test("validarDataVencimento deve rejeitar data passada", () => {
  const dataNoPast = new Date("2020-01-01");
  expect(validarDataVencimento(dataNoPast)).toBe(false);
});
```

#### UT-VAL-003: Validador matricula servidor

```typescript
test("validarMatricula deve validar formato", () => {
  expect(validarMatricula("MAT001")).toBe(true);
  expect(validarMatricula("12345")).toBe(false);
  expect(validarMatricula("")).toBe(false);
});
```

#### UT-VAL-004: Validador ID externo

```typescript
test("validarIDExterno deve aceitar alfanumérico", () => {
  expect(validarIDExterno("CONS-2026-001")).toBe(true);
  expect(validarIDExterno("@@!!")).toBe(false);
});
```

---

### calculadora-repasse.test.ts (3 testes)

#### UT-CALC-001: Calcular desconto

```typescript
test("calcularRepasse deve calcular desconto corretamente", () => {
  // valor: 1000, desconto: 50
  const result = calcularRepasse(1000, 50, "DESCONTO");
  expect(result.valor_liquido).toBe(950);
  expect(result.movimento.tipo).toBe("DESCONTO");
  expect(result.movimento.valor).toBe(50);
});
```

#### UT-CALC-002: Calcular acréscimo

```typescript
test("calcularRepasse deve calcular acréscimo", () => {
  const result = calcularRepasse(1000, 100, "ACRESCIMO");
  expect(result.valor_liquido).toBe(1100);
  expect(result.movimento.tipo).toBe("ACRESCIMO");
});
```

#### UT-CALC-003: Calcular juros

```typescript
test("calcularRepasse deve calcular juros com taxa", () => {
  // valor: 1000, taxa: 2% ao mês, dias: 30
  const result = calcularRepasse(1000, 2, "JUROS", { dias: 30 });
  expect(result.movimento.tipo).toBe("JUROS");
  expect(result.movimento.valor).toBeGreaterThan(0);
});
```

---

### reconciliacao.test.ts (4 testes)

#### UT-RECON-001: Reconciliação de parcela válida

```typescript
// Input: Linha folha com servidor.matricula + parcela.numero_parcela + consignataria_id match
// Expected: Parcela atualizada para CONCILIADA, taxa_reconciliacao = 100%

test("reconciliarParcelas deve conciliar parcela válida", async () => {
  const linhas = [{
    matricula: "MAT001",
    valor: 100.00,
    consignataria_id: "CONS-001"
  }];

  const result = await reconciliarParcelas(linhas, arquivoId);

  expect(result.conciliadas).toBe(1);
  expect(result.taxa_reconciliacao).toBe(100);
  expect(result.detalhamento.CONCILIADA).toBe(1);
  
  // Verificar atualização no BD
  const parcela = await prisma.parcela.findFirst({
    where: { status_reconciliacao: "CONCILIADA" }
  });
  expect(parcela?.arquivo_integracao_id).toBe(arquivoId);
});
```

#### UT-RECON-002: Erro de chave estrangeira (servidor ou consignatária não existe)

```typescript
// Input: Linha com matricula inexistente OU consignataria_id inexistente
// Expected: Parcela marcada ERRO_FK, não atualiza status

test("reconciliarParcelas deve detectar FK error", async () => {
  const linhas = [{
    matricula: "MAT_INVALIDO",
    valor: 100.00,
    consignataria_id: "CONS_INEXISTENTE"
  }];

  const result = await reconciliarParcelas(linhas, arquivoId);

  expect(result.erros).toBe(1);
  expect(result.detalhamento.ERRO_FK).toBe(1);
  
  // Não deve criar atualização
  const updates = await prisma.parcela.findMany({
    where: { arquivo_integracao_id: arquivoId }
  });
  expect(updates.length).toBe(0);
});
```

#### UT-RECON-003: Divergência de valor (tolerance 5 centavos)

```typescript
// Input: Valor em folha diferente do BD além de 5 centavos
// Expected: Parcela marcada ERRO_VALOR, registra diferença

test("reconciliarParcelas deve detectar divergência de valor", async () => {
  const linhas = [{
    matricula: "MAT001",
    valor: 100.50,  // BD tem 100.00, diferença = 0.50 > 0.05
    consignataria_id: "CONS-001"
  }];

  const result = await reconciliarParcelas(linhas, arquivoId);

  expect(result.erros).toBe(1);
  expect(result.detalhamento.ERRO_VALOR).toBe(1);
  
  const parcela = await prisma.parcela.findFirst({
    where: { status_reconciliacao: "ERRO_VALOR" }
  });
  expect(parcela?.divergencia).toBe(0.50);
});
```

#### UT-RECON-004: Parcela pendente (não encontrada em folha)

```typescript
// Input: Parcela existe em BD mas não vem em folha
// Expected: Parcela permanece com status PENDENTE

test("reconciliarParcelas deve deixar PENDENTE quando não vem em folha", async () => {
  // Criar parcela sem match em linhas
  const linhas = [{
    matricula: "MAT999",
    valor: 999.99,
    consignataria_id: "CONS-999"
  }];

  const result = await reconciliarParcelas(linhas, arquivoId);

  expect(result.pendentes).toBe(1);
  expect(result.detalhamento.PENDENTE).toBe(1);
  
  // Verificar que status não foi alterado
  const parcela = await prisma.parcela.findFirst({
    where: { status_reconciliacao: "PENDENTE" }
  });
  expect(parcela?.arquivo_integracao_id).toBeNull();
});
```

---

## 🔗 Testes de Integração (15 testes)

### arquivo.service.test.ts (15 testes)

#### IT-ARQ-001: Criar arquivo com metadados

```typescript
test("criarArquivo deve inserir registro em BD", async () => {
  const mockArquivo = {
    nome: "folha_jan_2026.csv",
    tipo: "FOLHA",
    consignante_id: 1,
    checksum: "abc123",
    usuario_id: 1,
  };

  const result = await arquivoService.criarArquivo(mockArquivo);

  expect(result.id).toBeDefined();
  expect(result.nome).toBe("folha_jan_2026.csv");
  expect(result.status).toBe("PENDENTE_PROCESSAMENTO");

  // Verificar em DB
  const stored = await prisma.arquivo.findUnique({ where: { id: result.id } });
  expect(stored).toBeDefined();
});
```

#### IT-ARQ-002: Detectar duplicação de arquivo

```typescript
test("criarArquivo deve rejeitar arquivo com checksum duplicado", async () => {
  const checksum = "abc123";

  // Primeiro upload
  await arquivoService.criarArquivo({
    nome: "folha1.csv",
    checksum,
    tipo: "FOLHA",
  });

  // Segundo upload com mesmo checksum
  const duplicate = arquivoService.criarArquivo({
    nome: "folha2.csv",
    checksum,
    tipo: "FOLHA",
  });

  await expect(duplicate).rejects.toThrow("Arquivo duplicado");
});
```

#### IT-ARQ-003: Processamento de arquivo 10 linhas

```typescript
test("processarArquivo deve processar 10 linhas válidas", async () => {
  // Simular arquivo com 10 linhas
  const csv = gerarCSVComLinhas(10);
  const arquivo = await arquivoService.criarArquivo({
    nome: "teste.csv",
    tipo: "FOLHA",
    conteudo: csv,
  });

  const result = await arquivoService.processarArquivo(arquivo.id);

  expect(result.linhas_processadas).toBe(10);
  expect(result.erros.length).toBe(0);
  expect(result.status).toBe("PROCESSADO");

  // Verificar que Parcelas foram criadas/atualizadas
  const parcelas = await prisma.parcela.findMany({
    where: { arquivo_id: arquivo.id },
  });
  expect(parcelas.length).toBe(10);
});
```

#### IT-ARQ-004: Processamento com erro em linha

```typescript
test("processarArquivo deve registrar erro em linha inválida", async () => {
  // Arquivo com 1 linha válida + 1 erro de valor negativo inválido
  const csv = `consignante_id,valor\n001,100\n002,-999`;
  const arquivo = await arquivoService.criarArquivo({
    nome: "teste_erro.csv",
    conteudo: csv,
  });

  const result = await arquivoService.processarArquivo(arquivo.id);

  expect(result.linhas_processadas).toBe(1);
  expect(result.erros.length).toBe(1);
  expect(result.erros[0].linha).toBe(3);
  expect(result.erros[0].motivo).toContain("valor negativo");
});
```

#### IT-ARQ-005: Atualizar status de Parcela

```typescript
test("processarArquivo deve atualizar Parcela status", async () => {
  // Criar Parcela no estado SOLICITADA
  const parcela = await prisma.parcela.create({
    data: {
      consignacao_id: 1,
      numero: 1,
      valor: 100,
      status_pagamento: "SOLICITADA",
    },
  });

  // Processamento de arquivo que marca como PROCESSADA
  const arquivo = await arquivoService.criarArquivo({
    nome: "folha.csv",
    conteudo: `consignante_id,parcela_id,valor\n001,${parcela.id},100`,
  });

  await arquivoService.processarArquivo(arquivo.id);

  const updated = await prisma.parcela.findUnique({
    where: { id: parcela.id },
  });
  expect(updated.status_pagamento).toBe("PROCESSADA");
  expect(updated.data_processamento_folha).toBeDefined();
});
```

#### IT-ARQ-006: Criação de Repasse (desconto)

```typescript
test("processarArquivo deve criar Repasse para desconto", async () => {
  const csv = `consignante_id,valor_liquido,desconto\n001,1000,50`;
  const arquivo = await arquivoService.criarArquivo({
    nome: "folha_repasse.csv",
    conteudo: csv,
  });

  await arquivoService.processarArquivo(arquivo.id);

  const repassos = await prisma.repasse.findMany({
    where: { arquivo_id: arquivo.id },
  });

  expect(repassos.length).toBeGreaterThan(0);
  expect(repassos[0].tipo).toBe("DESCONTO");
  expect(repassos[0].valor).toBe(50);
});
```

#### IT-ARQ-007: Rollback em caso de erro

```typescript
test("processarArquivo deve fazer rollback em erro crítico", async () => {
  const arquivo = await arquivoService.criarArquivo({
    nome: "folha_erro.csv",
  });

  // Simular erro crítico (ex: FK constraint)
  jest
    .spyOn(prisma.parcela, "create")
    .mockRejectedValue(new Error("FK Constraint failed"));

  const result = await arquivoService.processarArquivo(arquivo.id);

  // Arquivo deve voltar ao estado PENDENTE_PROCESSAMENTO
  const reloaded = await prisma.arquivo.findUnique({
    where: { id: arquivo.id },
  });
  expect(reloaded.status).toBe("ERRO_PROCESSAMENTO");

  // Nenhuma Parcela deve ter sido criada
  const count = await prisma.parcela.count({
    where: { arquivo_id: arquivo.id },
  });
  expect(count).toBe(0);
});
```

#### IT-ARQ-008: Export de retorno (CSV)

```typescript
test("exportarRetorno deve gerar CSV válido", async () => {
  // Criar 3 Parcelas conciliadas
  const parcelas = await criarParcelasDeTeste(3, "CONCILIADA");
  const arquivo = parcelas[0].arquivo;

  const csvOutput = await arquivoService.exportarRetorno(arquivo.id);

  expect(csvOutput).toContain("arquivo_id");
  expect(csvOutput).toContain("status_processamento");
  const linhas = csvOutput.split("\n");
  expect(linhas.length).toBe(4); // header + 3 dados
});
```

#### IT-ARQ-009: Query de reconciliação

```typescript
test("queryReconciliacao deve retornar breakdown por status", async () => {
  // Criar: 5 CONCILIADA, 2 PENDENTE
  const arquivo = await criarArquivoComParcelasDeTeste({
    CONCILIADA: 5,
    PENDENTE: 2,
  });

  const result = await arquivoService.queryReconciliacao({
    arquivo_id: arquivo.id,
  });

  expect(result.total).toBe(7);
  expect(result.CONCILIADA).toBe(5);
  expect(result.PENDENTE).toBe(2);
  expect(result.taxa_conciliacao).toBeCloseTo(71.4, 1);
});
```

#### IT-ARQ-010: Auditoria de operações

```typescript
test("processarArquivo deve registrar auditoria", async () => {
  const usuario_id = 1;
  const arquivo = await arquivoService.criarArquivo({
    nome: "folha.csv",
    usuario_id,
  });

  await arquivoService.processarArquivo(arquivo.id);

  const auditLog = await prisma.logAuditoria.findFirst({
    where: {
      acao: "ARQUIVO_PROCESSAMENTO",
      usuario_id,
    },
  });

  expect(auditLog).toBeDefined();
  expect(auditLog.detalhes).toContain(arquivo.id);
});
```

#### IT-ARQ-011: Rate-limiting (5 uploads/hora)

```typescript
test("processarArquivo deve respeitar rate-limiting", async () => {
  const usuario_id = 1;

  // Criar 5 uploads
  for (let i = 0; i < 5; i++) {
    await arquivoService.criarArquivo({
      nome: `folha${i}.csv`,
      usuario_id,
    });
  }

  // 6º upload deve falhar
  const sexto = arquivoService.criarArquivo({
    nome: "folha6.csv",
    usuario_id,
  });

  await expect(sexto).rejects.toThrow("Rate limit");
});
```

#### IT-ARQ-012: Permissão ADMINISTRADOR

```typescript
test("criarArquivo deve rejeitar usuário sem role ADMINISTRADOR", async () => {
  const usuarioUser = await prisma.usuario.create({
    data: {
      email: "user@test.com",
      senha_hash: "xyz",
      perfil_id: PERFIL_USUARIO_ID, // não admin
    },
  });

  const uploadPorUser = arquivoService.criarArquivo({
    nome: "folha.csv",
    usuario_id: usuarioUser.id,
  });

  await expect(uploadPorUser).rejects.toThrow("Permissão negada");
});
```

#### IT-ARQ-013: Backup automático pré-processamento

```typescript
test("criarArquivo deve fazer backup antes de processar", async () => {
  const arquivo = await arquivoService.criarArquivo({
    nome: "folha.csv",
    conteudo: Buffer.from("dados"),
  });

  // Verificar que arquivo foi salvo em storage
  const stored = await getFileFromStorage(`arquivos/${arquivo.id}.csv.bak`);
  expect(stored).toBeDefined();
  expect(stored.length).toBeGreaterThan(0);
});
```

#### IT-ARQ-014: Transação ACID em processamento

```typescript
test("processarArquivo deve garantir atomicidade", async () => {
  const arquivo = await arquivoService.criarArquivo({
    nome: "folha_acid.csv",
  });

  // Mock parcela create com erro após 2 inserts
  let callCount = 0;
  jest.spyOn(prisma.parcela, "create").mockImplementation(async (args) => {
    callCount++;
    if (callCount > 2) {
      throw new Error("Erro forçado");
    }
    return originalCreate(args);
  });

  await expect(arquivoService.processarArquivo(arquivo.id)).rejects.toThrow();

  // Nenhuma parcela deve ter sido inserida (rollback)
  const count = await prisma.parcela.count({
    where: { arquivo_id: arquivo.id },
  });
  expect(count).toBe(0);
});
```

#### IT-ARQ-015: Importação de arquivo legado

```typescript
test("importarLegado deve parsear banco MACAEPREV antigo", async () => {
  // Simular dump SQL legado
  const legacySQL = `
    INSERT INTO consignacoes VALUES (1, 'MAT001', 1000, ...);
    INSERT INTO consignacoes VALUES (2, 'MAT002', 2000, ...);
  `;

  const result = await arquivoService.importarLegado(legacySQL);

  expect(result.total_importadas).toBe(2);
  expect(result.erros.length).toBe(0);

  // Verificar que foram criadas
  const count = await prisma.consignacao.count();
  expect(count).toBeGreaterThanOrEqual(2);
});
```

---

## 🌐 Testes E2E (10 testes)

### arquivo.e2e.test.ts (10 testes)

#### E2E-001: Upload e processamento completo

```typescript
test("POST /api/arquivos/import + processamento", async () => {
  // Preparar arquivo
  const csv = Buffer.from("consignante_id,valor\n001,1000");
  const form = new FormData();
  form.append("file", csv, "folha.csv");
  form.append("checksum", hashMD5(csv));

  // Upload
  const response = await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", csv, "folha.csv");

  expect(response.status).toBe(201);
  expect(response.body.arquivo_id).toBeDefined();
  expect(response.body.linhas_processadas).toBe(1);
  expect(response.body.status).toBe("PROCESSADO");
});
```

#### E2E-002: Upload duplicado

```typescript
test("POST /api/arquivos/import com arquivo duplicado deve retornar 409", async () => {
  const csv = Buffer.from("dados");
  const checksum = hashMD5(csv);

  // Primeiro upload OK
  await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", csv, "folha1.csv");

  // Segundo upload com mesmo arquivo
  const response = await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", csv, "folha2.csv");

  expect(response.status).toBe(409);
  expect(response.body.error).toContain("duplicado");
});
```

#### E2E-003: Upload com arquivo inválido

```typescript
test("POST /api/arquivos/import com CSV malformado deve retornar 400", async () => {
  const csv = Buffer.from("dados,incompletos"); // faltam headers obrigatórios

  const response = await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", csv, "invalido.csv");

  expect(response.status).toBe(400);
  expect(response.body.error).toContain("Schema");
});
```

#### E2E-004: Upload sem autenticação

```typescript
test("POST /api/arquivos/import sem auth deve retornar 401", async () => {
  const csv = Buffer.from("dados");

  const response = await api
    .post("/api/arquivos/import")
    .attach("file", csv, "folha.csv");

  expect(response.status).toBe(401);
});
```

#### E2E-005: GET /api/arquivos/:id

```typescript
test("GET /api/arquivos/:id deve retornar metadados", async () => {
  // Upload primeiro
  const upload = await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", Buffer.from("dados"), "folha.csv");

  const arquivo_id = upload.body.arquivo_id;

  // Recuperar metadados
  const response = await api
    .get(`/api/arquivos/${arquivo_id}`)
    .set("Authorization", `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  expect(response.body.id).toBe(arquivo_id);
  expect(response.body.status).toBe("PROCESSADO");
  expect(response.body.linhas).toBeGreaterThan(0);
});
```

#### E2E-006: GET /api/arquivos/export

```typescript
test("GET /api/arquivos/export deve retornar CSV", async () => {
  // Upload + processamento
  const upload = await uploadArquivoDeTeste();

  // Export
  const response = await api
    .get("/api/arquivos/export")
    .set("Authorization", `Bearer ${authToken}`)
    .query({ data_inicio: "2026-01-01", data_fim: "2026-01-31" });

  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toContain("text/csv");
  expect(response.text).toContain("arquivo_id");
  expect(response.text).toContain("status_processamento");
});
```

#### E2E-007: GET /api/reconciliacao/relatorio

```typescript
test("GET /api/reconciliacao/relatorio filtrando", async () => {
  // Setup: 3 arquivos processados
  await setupReconciliacaoDeTeste();

  const response = await api
    .get("/api/reconciliacao/relatorio")
    .set("Authorization", `Bearer ${authToken}`)
    .query({
      data_inicio: "2026-01-01",
      data_fim: "2026-01-31",
      consignante_id: 1,
    });

  expect(response.status).toBe(200);
  expect(response.body.total_parcelas).toBeGreaterThan(0);
  expect(response.body.conciliadas).toBeDefined();
  expect(response.body.pendentes).toBeDefined();
  expect(response.body.taxa_reconciliacao).toBeGreaterThanOrEqual(0);
});
```

#### E2E-008: Rate-limiting (5 uploads/hora)

```typescript
test("POST /api/arquivos/import rate-limiting", async () => {
  // Criar 5 uploads rápido
  for (let i = 0; i < 5; i++) {
    const response = await api
      .post("/api/arquivos/import")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from(`dados${i}`), `folha${i}.csv`);
    expect(response.status).toBe(201);
  }

  // 6º deve falhar
  const response6 = await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", Buffer.from("dados6"), "folha6.csv");

  expect(response6.status).toBe(429);
  expect(response6.body.error).toContain("rate");
});
```

#### E2E-009: Permissão ADMINISTRADOR

```typescript
test("POST /api/arquivos/import rejeita usuário sem role ADMIN", async () => {
  const userToken = gerarAuthTokenParaPerfil("USUARIO"); // não ADMIN

  const response = await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${userToken}`)
    .attach("file", Buffer.from("dados"), "folha.csv");

  expect(response.status).toBe(403);
  expect(response.body.error).toContain("Permissão");
});
```

#### E2E-010: Fluxo completo (upload → processamento → export → relatório)

```typescript
test("Fluxo completo: Upload → Processamento → Export → Reconciliação", async () => {
  // 1. Upload
  const uploadRes = await api
    .post("/api/arquivos/import")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", gerarCSV(20), "folha.csv");

  expect(uploadRes.status).toBe(201);
  const arquivo_id = uploadRes.body.arquivo_id;

  // 2. Verificar processamento
  const metaRes = await api
    .get(`/api/arquivos/${arquivo_id}`)
    .set("Authorization", `Bearer ${authToken}`);

  expect(metaRes.body.linhas_processadas).toBe(20);
  expect(metaRes.body.erros.length).toBe(0);

  // 3. Export
  const exportRes = await api
    .get("/api/arquivos/export")
    .set("Authorization", `Bearer ${authToken}`);

  expect(exportRes.status).toBe(200);
  expect(exportRes.text.split("\n").length).toBeGreaterThan(1);

  // 4. Reconciliação
  const reconRes = await api
    .get("/api/reconciliacao/relatorio")
    .set("Authorization", `Bearer ${authToken}`);

  expect(reconRes.body.total_parcelas).toBeGreaterThan(0);
});
```

---

## 🎯 Cobertura de Testes por Componente

| Componente      | Unit Tests | Integration | E2E    | Total  | Cobertura |
| --------------- | ---------- | ----------- | ------ | ------ | --------- |
| CSV Parser      | 8          | 3           | -      | 11     | 90%       |
| Validators      | 4          | 2           | -      | 6      | 85%       |
| ArquivoService  | -          | 12          | 8      | 20     | 88%       |
| Reconciliacao   | 1          | 2           | 2      | 5      | 80%       |
| Byline Tracking | 2          | 2           | 1      | 5      | 75%       |
| **Total**       | **15**     | **15**      | **10** | **40** | **85%**   |

---

## ✅ Definition of Done (Testes)

- [ ] 15 unit tests para CSV parser, validators, calculadora
- [ ] 15 integration tests para ArquivoService e reconciliação
- [ ] 10 E2E tests para fluxos completos
- [ ] Cobertura ≥ 80% em /api/src
- [ ] Cobertura ≥ 70% em /web/src
- [ ] `npm test` no /api: 40/40 passando ✅
- [ ] `npm test` no /web: CI tests passando
- [ ] Performance: Parser 1000 linhas < 5s
- [ ] Performance: Reconciliação 5000 parcelas < 10s
- [ ] ESLint 0 erros
- [ ] TypeScript strict: sem warnings
