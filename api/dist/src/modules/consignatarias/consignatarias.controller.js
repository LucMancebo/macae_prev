"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsignatariasController = void 0;
const consignatarias_service_1 = require("./consignatarias.service");
const audit_service_1 = require("../audit/audit.service");
class ConsignatariasController {
    service = new consignatarias_service_1.ConsignatariasService();
    listar = async (request, reply) => {
        const query = request.query;
        const result = await this.service.listar(query);
        return reply.send(result);
    };
    buscarPorId = async (request, reply) => {
        const { id } = request.params;
        const result = await this.service.buscarPorId(id);
        return reply.send(result);
    };
    criar = async (request, reply) => {
        const data = request.body;
        const result = await this.service.criar(data);
        await audit_service_1.AuditService.registrar(request, {
            usuario_id: request.user.id,
            entidade: 'Consignataria',
            entidade_id: result.id,
            acao: 'INCLUSAO',
            dados_novos: result
        });
        return reply.status(201).send(result);
    };
    atualizar = async (request, reply) => {
        const { id } = request.params;
        const data = request.body;
        const anterior = await this.service.buscarPorId(id);
        const result = await this.service.atualizar(id, data);
        // Limpeza de relações para o log
        const { produtos, contratos, ...dadosAnterioresLimpos } = anterior;
        const { produtos: p1, contratos: c1, ...dadosNovosLimpos } = result;
        await audit_service_1.AuditService.registrar(request, {
            usuario_id: request.user.id,
            entidade: 'Consignataria',
            entidade_id: result.id,
            acao: 'ALTERACAO',
            dados_anteriores: dadosAnterioresLimpos,
            dados_novos: dadosNovosLimpos
        });
        return reply.send(result);
    };
    excluir = async (request, reply) => {
        const { id } = request.params;
        const anterior = await this.service.buscarPorId(id);
        await this.service.excluir(id);
        const { produtos, contratos, ...dadosAnterioresLimpos } = anterior;
        await audit_service_1.AuditService.registrar(request, {
            usuario_id: request.user.id,
            entidade: 'Consignataria',
            entidade_id: id,
            acao: 'EXCLUSAO',
            dados_anteriores: dadosAnterioresLimpos
        });
        return reply.status(204).send();
    };
}
exports.ConsignatariasController = ConsignatariasController;
