"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosService = void 0;
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UsuariosService {
    async listar(params) {
        const { page = 1, limit = 10, search } = params;
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { nome: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        } : {};
        const [total, items] = await Promise.all([
            database_1.prisma.usuario.count({ where }),
            database_1.prisma.usuario.findMany({
                where,
                skip,
                take: limit,
                include: {
                    perfil: { select: { nome: true } },
                    consignataria: { select: { razao_social: true } }
                },
                orderBy: { nome: 'asc' }
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
    async criar(data) {
        const { senha_plana, ...rest } = data;
        const senha_hash = await bcryptjs_1.default.hash(senha_plana, 10);
        const exists = await database_1.prisma.usuario.findUnique({ where: { email: rest.email } });
        if (exists)
            throw new Error('E-mail já cadastrado');
        return database_1.prisma.usuario.create({
            data: {
                ...rest,
                senha_hash
            }
        });
    }
    async atualizar(id, data) {
        const { senha_plana, ...rest } = data;
        const payload = { ...rest };
        if (senha_plana) {
            payload.senha_hash = await bcryptjs_1.default.hash(senha_plana, 10);
        }
        return database_1.prisma.usuario.update({
            where: { id },
            data: payload
        });
    }
    async excluir(id) {
        // Master Admin não pode ser excluído por segurança (ID fixo no seed se necessário)
        const user = await database_1.prisma.usuario.findUnique({ where: { id } });
        if (user?.email === 'admin@macaeprev.rj.gov.br') {
            throw new Error('O Administrador Master não pode ser excluído');
        }
        return database_1.prisma.usuario.delete({ where: { id } });
    }
}
exports.UsuariosService = UsuariosService;
