"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosController = void 0;
const database_1 = require("../../config/database");
const usuarios_service_1 = require("./usuarios.service");
const audit_service_1 = require("../audit/audit.service");
class UsuariosController {
    service = new usuarios_service_1.UsuariosService();
    listar = async (request, reply) => {
        const query = request.query;
        const result = await this.service.listar(query);
        return reply.send(result);
    };
    criar = async (request, reply) => {
        const data = request.body;
        const result = await this.service.criar(data);
        await audit_service_1.AuditService.registrar(request, {
            usuario_id: request.user.id,
            entidade: 'Usuario',
            entidade_id: result.id,
            acao: 'INCLUSAO',
            dados_novos: { nome: result.nome, email: result.email, perfil_id: result.perfil_id }
        });
        return reply.status(201).send(result);
    };
    atualizar = async (request, reply) => {
        const { id } = request.params;
        const data = request.body;
        const anterior = await database_1.prisma.usuario.findUnique({ where: { id } });
        const result = await this.service.atualizar(id, data);
        await audit_service_1.AuditService.registrar(request, {
            usuario_id: request.user.id,
            entidade: 'Usuario',
            entidade_id: result.id,
            acao: 'ALTERACAO',
            dados_anteriores: { nome: anterior?.nome, email: anterior?.email },
            dados_novos: { nome: result.nome, email: result.email }
        });
        return reply.send(result);
    };
    excluir = async (request, reply) => {
        const { id } = request.params;
        const anterior = await database_1.prisma.usuario.findUnique({ where: { id } });
        await this.service.excluir(id);
        await audit_service_1.AuditService.registrar(request, {
            usuario_id: request.user.id,
            entidade: 'Usuario',
            entidade_id: id,
            acao: 'EXCLUSAO',
            dados_anteriores: { nome: anterior?.nome, email: anterior?.email }
        });
        return reply.status(204).send();
    };
}
exports.UsuariosController = UsuariosController;
