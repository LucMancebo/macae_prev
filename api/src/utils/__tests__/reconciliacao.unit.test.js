"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const reconciliacao_1 = require("../reconciliacao");
var prismaMock;
globals_1.jest.mock('../../config/database', () => {
    prismaMock = {
        servidor: {
            findUnique: globals_1.jest.fn(),
        },
        parcela: {
            findFirst: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
        },
    };
    return {
        prisma: prismaMock,
    };
});
(0, globals_1.describe)('reconciliarParcelas', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.it)('deve conciliar uma parcela válida e atualizar o status', async () => {
        const dataBase = new Date('2026-05-11T12:00:00.000Z');
        globals_1.jest.spyOn(Date, 'now').mockReturnValue(dataBase.getTime());
        prismaMock.servidor.findUnique.mockResolvedValue({ id: 'servidor-1' });
        prismaMock.parcela.findFirst.mockResolvedValue({
            id: 'parcela-1',
            valor: '450.00',
            contrato: { servidor_id: 'servidor-1', consignataria_id: 'B001' },
        });
        prismaMock.parcela.update.mockResolvedValue({ id: 'parcela-1' });
        const resultado = await (0, reconciliacao_1.reconciliarParcelas)([
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
        ], 'arquivo-1');
        (0, globals_1.expect)(resultado.conciliadas).toBe(1);
        (0, globals_1.expect)(resultado.pendentes).toBe(0);
        (0, globals_1.expect)(resultado.erros).toBe(0);
        (0, globals_1.expect)(resultado.detalhes_por_status.CONCILIADA).toBe(1);
        (0, globals_1.expect)(resultado.taxa_conciliacao).toBe(100);
        (0, globals_1.expect)(prismaMock.parcela.update).toHaveBeenCalledWith({
            where: { id: 'parcela-1' },
            data: {
                status_reconciliacao: 'CONCILIADA',
                arquivo_integracao_id: 'arquivo-1',
                data_processamento_folha: globals_1.expect.any(Date),
            },
        });
        globals_1.jest.restoreAllMocks();
    });
    (0, globals_1.it)('deve classificar linha inválida e servidor inexistente como erro', async () => {
        prismaMock.servidor.findUnique
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ id: 'servidor-2' });
        prismaMock.parcela.findFirst.mockResolvedValue({
            id: 'parcela-2',
            valor: '450.00',
            contrato: { servidor_id: 'servidor-2', consignataria_id: 'B001' },
        });
        prismaMock.parcela.update.mockResolvedValue({ id: 'parcela-2' });
        const resultado = await (0, reconciliacao_1.reconciliarParcelas)([
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
        ], 'arquivo-1');
        (0, globals_1.expect)(resultado.erros).toBe(2);
        (0, globals_1.expect)(resultado.detalhes_por_status.ERRO_FK).toBe(1);
        (0, globals_1.expect)(resultado.detalhes_por_status.ERRO_ARQUIVO).toBe(1);
        (0, globals_1.expect)(resultado.conciliadas).toBe(0);
        (0, globals_1.expect)(resultado.pendentes).toBe(0);
        (0, globals_1.expect)(resultado.detalhes_por_motivo['Servidor não encontrado']).toBe(1);
        (0, globals_1.expect)(resultado.detalhes_por_motivo['Linha inválida']).toBe(1);
        (0, globals_1.expect)(prismaMock.parcela.update).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('deve marcar divergência de valor e atualizar a parcela com erro', async () => {
        prismaMock.servidor.findUnique.mockResolvedValue({ id: 'servidor-1' });
        prismaMock.parcela.findFirst.mockResolvedValue({
            id: 'parcela-1',
            valor: '450.00',
            contrato: { servidor_id: 'servidor-1', consignataria_id: 'B001' },
        });
        prismaMock.parcela.update.mockResolvedValue({ id: 'parcela-1' });
        const resultado = await (0, reconciliacao_1.reconciliarParcelas)([
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
        ], 'arquivo-1');
        (0, globals_1.expect)(resultado.erros).toBe(1);
        (0, globals_1.expect)(resultado.detalhes_por_status.ERRO_VALOR).toBe(1);
        (0, globals_1.expect)(resultado.conciliadas).toBe(0);
        (0, globals_1.expect)(resultado.pendentes).toBe(0);
        (0, globals_1.expect)(resultado.detalhes_por_motivo['Valor divergente']).toBe(1);
        (0, globals_1.expect)(prismaMock.parcela.update).toHaveBeenCalledWith({
            where: { id: 'parcela-1' },
            data: {
                status_reconciliacao: 'ERRO_VALOR',
                arquivo_integracao_id: 'arquivo-1',
            },
        });
    });
    (0, globals_1.it)('deve contabilizar parcela ausente como pendente', async () => {
        prismaMock.servidor.findUnique.mockResolvedValue({ id: 'servidor-1' });
        prismaMock.parcela.findFirst.mockResolvedValue(null);
        const resultado = await (0, reconciliacao_1.reconciliarParcelas)([
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
        ], 'arquivo-1');
        (0, globals_1.expect)(resultado.pendentes).toBe(1);
        (0, globals_1.expect)(resultado.detalhes_por_status.PENDENTE).toBe(1);
        (0, globals_1.expect)(resultado.conciliadas).toBe(0);
        (0, globals_1.expect)(resultado.erros).toBe(0);
        (0, globals_1.expect)(resultado.detalhes_por_motivo['Parcela não encontrada']).toBe(1);
        (0, globals_1.expect)(prismaMock.parcela.update).not.toHaveBeenCalled();
    });
});
