import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { reconciliarParcelas } from '../reconciliacao';

var prismaMock: any;

jest.mock('../../config/database', () => {
    prismaMock = {
        servidor: {
            findUnique: jest.fn(),
        },
        parcela: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    };

    return {
        prisma: prismaMock,
    };
});

describe('reconciliarParcelas', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve conciliar uma parcela válida e atualizar o status', async () => {
        const dataBase = new Date('2026-05-11T12:00:00.000Z');
        jest.spyOn(Date, 'now').mockReturnValue(dataBase.getTime());

        prismaMock.servidor.findUnique.mockResolvedValue({ id: 'servidor-1' });
        prismaMock.parcela.findFirst.mockResolvedValue({
            id: 'parcela-1',
            valor: '450.00',
            contrato: { servidor_id: 'servidor-1', consignataria_id: 'B001' },
        });
        prismaMock.parcela.update.mockResolvedValue({ id: 'parcela-1' });

        const resultado = await reconciliarParcelas(
            [
                {
                    arquivo_id: 'arquivo-1',
                    numero_linha: 2,
                    consignante_id: 'MACAEPREV',
                    consignataria_id: 'B001',
                    servidor_matricula: 'MAT001',
                    servidor_nome: 'João Silva',
                    produto_id: 'PROD001',
                    valor_liquido: 5000,
                    taxa_efetiva: 5.1234,
                    cet: 5.1234,
                    parcela_numero: 1,
                    valor_parcela: 450,
                    data_vencimento: new Date('2026-06-15'),
                    status: 'VALIDA',
                },
            ],
            'arquivo-1',
        );

        expect(resultado.conciliadas).toBe(1);
        expect(resultado.pendentes).toBe(0);
        expect(resultado.erros).toBe(0);
        expect(resultado.detalhes_por_status.CONCILIADA).toBe(1);
        expect(resultado.taxa_conciliacao).toBe(100);
        expect(prismaMock.parcela.update).toHaveBeenCalledWith({
            where: { id: 'parcela-1' },
            data: {
                status_reconciliacao: 'CONCILIADA',
                arquivo_integracao_id: 'arquivo-1',
                data_processamento_folha: expect.any(Date),
            },
        });

        jest.restoreAllMocks();
    });

    it('deve classificar linha inválida e servidor inexistente como erro', async () => {
        prismaMock.servidor.findUnique
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ id: 'servidor-2' });

        prismaMock.parcela.findFirst.mockResolvedValue({
            id: 'parcela-2',
            valor: '450.00',
            contrato: { servidor_id: 'servidor-2', consignataria_id: 'B001' },
        });
        prismaMock.parcela.update.mockResolvedValue({ id: 'parcela-2' });

        const resultado = await reconciliarParcelas(
            [
                {
                    arquivo_id: 'arquivo-1',
                    numero_linha: 2,
                    consignante_id: 'MACAEPREV',
                    consignataria_id: 'B001',
                    servidor_matricula: 'MAT-INV',
                    servidor_nome: 'Linha inválida',
                    produto_id: 'PROD001',
                    valor_liquido: 5000,
                    taxa_efetiva: 5.1234,
                    cet: 5.1234,
                    parcela_numero: 1,
                    valor_parcela: 450,
                    data_vencimento: new Date('2026-06-15'),
                    status: 'VALIDA',
                },
                {
                    arquivo_id: 'arquivo-1',
                    numero_linha: 3,
                    consignante_id: 'MACAEPREV',
                    consignataria_id: 'B001',
                    servidor_matricula: 'MAT002',
                    servidor_nome: 'Maria Souza',
                    produto_id: 'PROD001',
                    valor_liquido: 5000,
                    taxa_efetiva: 5.1234,
                    cet: 5.1234,
                    parcela_numero: 1,
                    valor_parcela: 450,
                    data_vencimento: new Date('2026-06-15'),
                    status: 'ERRO_VALIDACAO',
                },
            ],
            'arquivo-1',
        );

        expect(resultado.erros).toBe(2);
        expect(resultado.detalhes_por_status.ERRO_FK).toBe(1);
        expect(resultado.detalhes_por_status.ERRO_ARQUIVO).toBe(1);
        expect(resultado.conciliadas).toBe(0);
        expect(resultado.pendentes).toBe(0);
        expect(resultado.detalhes_por_motivo['Servidor não encontrado']).toBe(1);
        expect(resultado.detalhes_por_motivo['Linha inválida']).toBe(1);
        expect(prismaMock.parcela.update).not.toHaveBeenCalled();
    });

    it('deve marcar divergência de valor e atualizar a parcela com erro', async () => {
        prismaMock.servidor.findUnique.mockResolvedValue({ id: 'servidor-1' });
        prismaMock.parcela.findFirst.mockResolvedValue({
            id: 'parcela-1',
            valor: '450.00',
            contrato: { servidor_id: 'servidor-1', consignataria_id: 'B001' },
        });
        prismaMock.parcela.update.mockResolvedValue({ id: 'parcela-1' });

        const resultado = await reconciliarParcelas(
            [
                {
                    arquivo_id: 'arquivo-1',
                    numero_linha: 2,
                    consignante_id: 'MACAEPREV',
                    consignataria_id: 'B001',
                    servidor_matricula: 'MAT001',
                    servidor_nome: 'João Silva',
                    produto_id: 'PROD001',
                    valor_liquido: 5000,
                    taxa_efetiva: 5.1234,
                    cet: 5.1234,
                    parcela_numero: 1,
                    valor_parcela: 470,
                    data_vencimento: new Date('2026-06-15'),
                    status: 'VALIDA',
                },
            ],
            'arquivo-1',
        );

        expect(resultado.erros).toBe(1);
        expect(resultado.detalhes_por_status.ERRO_VALOR).toBe(1);
        expect(resultado.conciliadas).toBe(0);
        expect(resultado.pendentes).toBe(0);
        expect(resultado.detalhes_por_motivo['Valor divergente']).toBe(1);
        expect(prismaMock.parcela.update).toHaveBeenCalledWith({
            where: { id: 'parcela-1' },
            data: {
                status_reconciliacao: 'ERRO_VALOR',
                arquivo_integracao_id: 'arquivo-1',
            },
        });
    });

    it('deve contabilizar parcela ausente como pendente', async () => {
        prismaMock.servidor.findUnique.mockResolvedValue({ id: 'servidor-1' });
        prismaMock.parcela.findFirst.mockResolvedValue(null);

        const resultado = await reconciliarParcelas(
            [
                {
                    arquivo_id: 'arquivo-1',
                    numero_linha: 2,
                    consignante_id: 'MACAEPREV',
                    consignataria_id: 'B001',
                    servidor_matricula: 'MAT001',
                    servidor_nome: 'João Silva',
                    produto_id: 'PROD001',
                    valor_liquido: 5000,
                    taxa_efetiva: 5.1234,
                    cet: 5.1234,
                    parcela_numero: 1,
                    valor_parcela: 450,
                    data_vencimento: new Date('2026-06-15'),
                    status: 'VALIDA',
                },
            ],
            'arquivo-1',
        );

        expect(resultado.pendentes).toBe(1);
        expect(resultado.detalhes_por_status.PENDENTE).toBe(1);
        expect(resultado.conciliadas).toBe(0);
        expect(resultado.erros).toBe(0);
        expect(resultado.detalhes_por_motivo['Parcela não encontrada']).toBe(1);
        expect(prismaMock.parcela.update).not.toHaveBeenCalled();
    });
});