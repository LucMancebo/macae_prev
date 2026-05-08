"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = require("../../config/database");
class AuditService {
    static async registrar(req, payload) {
        try {
            const ip_origem = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const user_agent = req.headers['user-agent'] || 'Desconhecido';
            await database_1.prisma.logAuditoria.create({
                data: {
                    usuario_id: payload.usuario_id,
                    entidade: payload.entidade,
                    entidade_id: payload.entidade_id,
                    acao: payload.acao,
                    dados_anteriores: payload.dados_anteriores ? JSON.parse(JSON.stringify(payload.dados_anteriores)) : null,
                    dados_novos: payload.dados_novos ? JSON.parse(JSON.stringify(payload.dados_novos)) : null,
                    ip_origem: ip_origem,
                    user_agent: user_agent
                }
            });
        }
        catch (error) {
            console.error('🚨 CRITICAL: Falha ao registrar log de auditoria no banco de dados!');
            req.server.log.error(error, 'Falha ao registrar log de auditoria');
        }
    }
    static async buscarPorEntidade(entidade, entidade_id) {
        return database_1.prisma.logAuditoria.findMany({
            where: {
                entidade,
                entidade_id
            },
            include: {
                usuario: {
                    select: { nome: true, email: true }
                }
            },
            orderBy: {
                data_hora: 'desc'
            }
        });
    }
}
exports.AuditService = AuditService;
