"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const arquivo_service_1 = require("../modules/arquivos/arquivo.service");
(0, globals_1.describe)('ArquivoService', () => {
    const service = new arquivo_service_1.ArquivoService();
    (0, globals_1.it)('deve validar arquivo CSV com nome e checksum válidos', async () => {
        const csv = [
            'consignante_id,consignataria_id,servidor_matricula,servidor_nome,produto_id,valor_liquido,taxa_efetiva,cet,parcela_numero,valor_parcela,data_vencimento',
            'MACAEPREV,B001,MAT001,João Silva,PROD001,5000.00,5.1234,5.1234,1,450.00,2026-06-15'
        ].join('\r\n');
        const validacao = await service.validarArquivoEntrada(Buffer.from(csv), 'FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv');
        (0, globals_1.expect)(validacao.valido).toBe(true);
        (0, globals_1.expect)(validacao.nome_valido).toBe(true);
        (0, globals_1.expect)(validacao.duplicado).toBe(false);
    });
    (0, globals_1.it)('deve processar folha e sinalizar linhas duplicadas', async () => {
        const futura = new Date();
        futura.setDate(futura.getDate() + 2);
        const dataVencimento = futura.toISOString().split('T')[0];
        const csv = [
            'consignante_id,consignataria_id,servidor_matricula,servidor_nome,produto_id,valor_liquido,desconto_consignante,taxa_efetiva,cet,parcela_numero,valor_parcela,data_vencimento,desconto_retencao,acrescimo_juros,observacoes',
            `MACAEPREV,B001,MAT001,Joao Silva,PROD001,5000.00,0.00,5.1234,5.1234,1,450.00,${dataVencimento},0.00,0.00,`,
            `MACAEPREV,B001,MAT001,Joao Silva,PROD001,5000.00,0.00,5.1234,5.1234,1,450.00,${dataVencimento},0.00,0.00,Duplicada`
        ].join('\r\n');
        const resultado = await service.processarFolhaCSV(Buffer.from(csv), 'FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv');
        (0, globals_1.expect)(resultado.parse.sucesso).toBe(false);
        (0, globals_1.expect)(resultado.parse.linhas_validas).toBe(1);
        (0, globals_1.expect)(resultado.parse.linhas_erro).toBe(1);
        (0, globals_1.expect)(resultado.resumo.status).toBe('ERRO_PROCESSAMENTO');
        (0, globals_1.expect)(resultado.resumo.erros.length).toBeGreaterThan(0);
    });
    (0, globals_1.it)('deve gerar CSV de retorno com colunas esperadas', () => {
        const futura = new Date();
        futura.setDate(futura.getDate() + 2);
        const retorno = service.gerarCsvRetorno([
            {
                arquivo_id: 'arquivo-1',
                numero_linha: 2,
                consignante_id: 'MACAEPREV',
                consignataria_id: 'B001',
                servidor_matricula: 'MAT001',
                servidor_nome: 'Joao Silva',
                produto_id: 'PROD001',
                valor_liquido: 5000,
                taxa_efetiva: 5.1234,
                cet: 5.1234,
                parcela_numero: 1,
                valor_parcela: 450,
                data_vencimento: futura,
                status: 'VALIDA'
            }
        ], { arquivoId: 'arquivo-xyz', dataGeracao: futura });
        (0, globals_1.expect)(retorno.linhas).toBe(1);
        (0, globals_1.expect)(retorno.csv).toContain('arquivo-xyz');
        (0, globals_1.expect)(retorno.csv).toContain('CONCILIADA');
        (0, globals_1.expect)(retorno.nome_arquivo).toMatch(/^FOLHA_RETORNO_MACAEPREV_/);
    });
});
