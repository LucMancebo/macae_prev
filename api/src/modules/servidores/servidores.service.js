"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServidoresService = void 0;
const database_1 = require("../../config/database");
const validators_1 = require("../../utils/validators");
const date_utils_1 = require("../../utils/date-utils");
class ServidoresService {
    async listar(params) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search ? {
                    OR: [
                        { nome: { contains: search, mode: 'insensitive' } },
                        { cpf: { contains: search } },
                        { matricula: { contains: search } }
                    ]
                } : {},
                status ? { status } : {}
            ]
        };
        const [total, items] = await Promise.all([
            database_1.prisma.servidor.count({ where }),
            database_1.prisma.servidor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
                include: {
                    margens_servidor: {
                        include: { margem: true }
                    }
                }
            })
        ]);
        return {
            items,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        };
    }
    async buscarPorId(id) {
        const servidor = await database_1.prisma.servidor.findUnique({
            where: { id },
            include: {
                margens_servidor: {
                    include: { margem: true }
                },
                contratos: {
                    include: {
                        consignataria: true,
                        produto: true
                    }
                }
            }
        });
        if (!servidor)
            throw new Error('Servidor não encontrado');
        return servidor;
    }
    async criar(data) {
        // Validar formato do CPF
        if (!(0, validators_1.validarCPF)(data.cpf)) {
            throw new Error('CPF matematicamente inválido');
        }
        // Validar CPF único
        const cpfExists = await database_1.prisma.servidor.findUnique({ where: { cpf: data.cpf } });
        if (cpfExists)
            throw new Error('CPF já cadastrado');
        // Validar Matrícula única
        const matriculaExists = await database_1.prisma.servidor.findUnique({ where: { matricula: data.matricula } });
        if (matriculaExists)
            throw new Error('Matrícula já cadastrada');
        // Normalizar data de admissão
        if (data.data_admissao) {
            data.data_admissao = (0, date_utils_1.normalizarData)(data.data_admissao);
        }
        return database_1.prisma.servidor.create({ data });
    }
    async atualizar(id, data) {
        const servidor = await database_1.prisma.servidor.findUnique({ where: { id } });
        if (!servidor)
            throw new Error('Servidor não encontrado');
        // Se estiver alterando CPF, validar formato e unicidade
        if (data.cpf && data.cpf !== servidor.cpf) {
            if (!(0, validators_1.validarCPF)(data.cpf)) {
                throw new Error('Novo CPF matematicamente inválido');
            }
            const cpfExists = await database_1.prisma.servidor.findUnique({ where: { cpf: data.cpf } });
            if (cpfExists)
                throw new Error('Novo CPF já cadastrado em outro registro');
        }
        // Normalizar data de admissão se enviada
        if (data.data_admissao) {
            data.data_admissao = (0, date_utils_1.normalizarData)(data.data_admissao);
        }
        return database_1.prisma.servidor.update({
            where: { id },
            data
        });
    }
    async excluir(id) {
        const servidor = await database_1.prisma.servidor.findUnique({
            where: { id },
            include: { _count: { select: { contratos: true } } }
        });
        if (!servidor)
            throw new Error('Servidor não encontrado');
        if (servidor._count.contratos > 0) {
            throw new Error('Não é possível excluir um servidor com contratos ativos');
        }
        return database_1.prisma.servidor.delete({ where: { id } });
    }
}
exports.ServidoresService = ServidoresService;
