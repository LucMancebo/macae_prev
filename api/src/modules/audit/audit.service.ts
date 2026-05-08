import { prisma } from '../../config/database';
import { FastifyRequest } from 'fastify';

interface AuditLogPayload {
    usuario_id: string;
    entidade: string;
    entidade_id: string;
    acao: 'INCLUSAO' | 'ALTERACAO' | 'EXCLUSAO' | 'CONSULTA' | 'LOGIN' | 'LOGOUT' | 'FALHA_LOGIN' | 'LOGIN_MFA' | 'MFA_ENABLE';
    dados_anteriores?: any;
    dados_novos?: any;
}

export class AuditService {
    public static async registrar(req: FastifyRequest, payload: AuditLogPayload) {
        try {
            const ip_origem = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const user_agent = req.headers['user-agent'] || 'Desconhecido';

            await prisma.logAuditoria.create({
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
        } catch (error: any) {
            console.error('🚨 CRITICAL: Falha ao registrar log de auditoria no banco de dados!');
            req.server.log.error(error, 'Falha ao registrar log de auditoria');
        }
    }

    public static async buscarPorEntidade(entidade: string, entidade_id: string) {
        return prisma.logAuditoria.findMany({
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
