import { describe, expect, it } from '@jest/globals';
import { ArquivoService } from '../modules/arquivos/arquivo.service';

describe('ArquivoService', () => {
    const service = new ArquivoService();

    it('deve validar arquivo CSV com nome e checksum válidos', async () => {
        const csv = [
            'consignante_id,consignataria_id,servidor_matricula,servidor_nome,produto_id,valor_liquido,taxa_efetiva,cet,parcela_numero,valor_parcela,data_vencimento',
            'MACAEPREV,B001,MAT001,João Silva,PROD001,5000.00,5.1234,5.1234,1,450.00,2026-06-15'
        ].join('\r\n');

        const validacao = await service.validarArquivoEntrada(Buffer.from(csv), 'FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv');

        expect(validacao.valido).toBe(true);
        expect(validacao.nome_valido).toBe(true);
        expect(validacao.duplicado).toBe(false);
    });

    it('deve processar folha e sinalizar linhas duplicadas', async () => {
        const futura = new Date();
        futura.setDate(futura.getDate() + 2);
        const dataVencimento = futura.toISOString().split('T')[0];

        const csv = [
            'consignante_id,consignataria_id,servidor_matricula,servidor_nome,produto_id,valor_liquido,desconto_consignante,taxa_efetiva,cet,parcela_numero,valor_parcela,data_vencimento,desconto_retencao,acrescimo_juros,observacoes',
            `MACAEPREV,B001,MAT001,Joao Silva,PROD001,5000.00,0.00,5.1234,5.1234,1,450.00,${dataVencimento},0.00,0.00,`,
            `MACAEPREV,B001,MAT001,Joao Silva,PROD001,5000.00,0.00,5.1234,5.1234,1,450.00,${dataVencimento},0.00,0.00,Duplicada`
        ].join('\r\n');

        const resultado = await service.processarFolhaCSV(
            Buffer.from(csv),
            'FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv'
        );

        expect(resultado.parse.sucesso).toBe(false);
        expect(resultado.parse.linhas_validas).toBe(1);
        expect(resultado.parse.linhas_erro).toBe(1);
        expect(resultado.resumo.status).toBe('ERRO_PROCESSAMENTO');
        expect(resultado.resumo.erros.length).toBeGreaterThan(0);
    });

    it('deve gerar CSV de retorno com colunas esperadas', () => {
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

        expect(retorno.linhas).toBe(1);
        expect(retorno.csv).toContain('arquivo-xyz');
        expect(retorno.csv).toContain('CONCILIADA');
        expect(retorno.nome_arquivo).toMatch(/^FOLHA_RETORNO_MACAEPREV_/);
    });
});