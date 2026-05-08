"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsignatariasService = void 0;
const database_1 = require("../../config/database");
const validators_1 = require("../../utils/validators");
class ConsignatariasService {
    async listar(params) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search ? {
                    OR: [
                        { razao_social: { contains: search, mode: 'insensitive' } },
                        { nome_fantasia: { contains: search, mode: 'insensitive' } },
                        { cnpj: { contains: search } }
                    ]
                } : {},
                status ? { status } : {}
            ]
        };
        const [total, items] = await Promise.all([
            database_1.prisma.consignataria.count({ where }),
            database_1.prisma.consignataria.findMany({
                where,
                skip,
                take: limit,
                orderBy: { razao_social: 'asc' }
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
        const item = await database_1.prisma.consignataria.findUnique({
            where: { id },
            include: {
                produtos: true,
                _count: { select: { contratos: true, usuarios: true } }
            }
        });
        if (!item)
            throw new Error('Consignatária não encontrada');
        return item;
    }
    async criar(data) {
        if (!(0, validators_1.validarCNPJ)(data.cnpj)) {
            throw new Error('CNPJ matematicamente inválido');
        }
        const exists = await database_1.prisma.consignataria.findUnique({ where: { cnpj: data.cnpj } });
        if (exists)
            throw new Error('CNPJ já cadastrado no sistema');
        return database_1.prisma.consignataria.create({ data });
    }
    async atualizar(id, data) {
        const item = await database_1.prisma.consignataria.findUnique({ where: { id } });
        if (!item)
            throw new Error('Consignatária não encontrada');
        if (data.cnpj && data.cnpj !== item.cnpj) {
            if (!(0, validators_1.validarCNPJ)(data.cnpj)) {
                throw new Error('Novo CNPJ matematicamente inválido');
            }
            const exists = await database_1.prisma.consignataria.findUnique({ where: { cnpj: data.cnpj } });
            if (exists)
                throw new Error('Este CNPJ já pertence a outra instituição');
        }
        return database_1.prisma.consignataria.update({
            where: { id },
            data
        });
    }
    async excluir(id) {
        const item = await database_1.prisma.consignataria.findUnique({
            where: { id },
            include: { _count: { select: { contratos: true } } }
        });
        if (!item)
            throw new Error('Consignatária não encontrada');
        if (item._count.contratos > 0) {
            throw new Error('Não é possível excluir uma consignatária com contratos ativos');
        }
        return database_1.prisma.consignataria.delete({ where: { id } });
    }
}
exports.ConsignatariasService = ConsignatariasService;
