"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsignacoesController = void 0;
const audit_service_1 = require("../audit/audit.service");
const consignacoes_service_1 = require("./consignacoes.service");
class ConsignacoesController {
    service = new consignacoes_service_1.ConsignacoesService();
    listar = async (request, reply) => {
        try {
            const query = request.query;
            const result = await this.service.listar(query);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    };
    buscarPorId = async (request, reply) => {
        try {
            const { id } = request.params;
            const result = await this.service.buscarPorId(id);
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };
    listarParcelas = async (request, reply) => {
        try {
            const { id } = request.params;
            const result = await this.service.listarParcelas(id);
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };
    criar = async (request, reply) => {
        try {
            const data = request.body;
            const result = await this.service.criar(data);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Contrato',
                entidade_id: result.id,
                acao: 'INCLUSAO',
                dados_novos: {
                    servidor_id: result.servidor_id,
                    consignataria_id: result.consignataria_id,
                    produto_id: result.produto_id,
                    valor_total: result.valor_total,
                    valor_parcela: result.valor_parcela,
                    status: result.status,
                    status_fluxo: result.status_fluxo
                }
            });
            return reply.status(201).send(result);
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    };
    aprovar = async (request, reply) => {
        try {
            const { id } = request.params;
            const usuarioId = request.user?.id;
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.aprovar(id, usuarioId);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: usuarioId || 'sistema',
                entidade: 'Contrato',
                entidade_id: result.id,
                acao: 'ALTERACAO',
                dados_anteriores: {
                    status: anterior.status,
                    status_fluxo: anterior.status_fluxo
                },
                dados_novos: {
                    status: result.status,
                    status_fluxo: result.status_fluxo,
                    data_aprovacao: result.data_aprovacao
                }
            });
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('SOLICITADAS')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };
    ativar = async (request, reply) => {
        try {
            const { id } = request.params;
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.ativar(id);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Contrato',
                entidade_id: result.id,
                acao: 'ALTERACAO',
                dados_anteriores: {
                    status: anterior.status,
                    status_fluxo: anterior.status_fluxo
                },
                dados_novos: {
                    status: result.status,
                    status_fluxo: result.status_fluxo
                }
            });
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('inválida') || error.message.includes('ATIVA') || error.message.includes('APROVADA')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };
    cancelar = async (request, reply) => {
        try {
            const { id } = request.params;
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.cancelar(id);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Contrato',
                entidade_id: result.id,
                acao: 'ALTERACAO',
                dados_anteriores: {
                    status: anterior.status,
                    status_fluxo: anterior.status_fluxo
                },
                dados_novos: {
                    status: result.status,
                    status_fluxo: result.status_fluxo
                }
            });
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(409).send({ error: error.message });
        }
    };
    quitar = async (request, reply) => {
        try {
            const { id } = request.params;
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.quitar(id);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Contrato',
                entidade_id: result.id,
                acao: 'ALTERACAO',
                dados_anteriores: {
                    status: anterior.status,
                    status_fluxo: anterior.status_fluxo
                },
                dados_novos: {
                    status: result.status,
                    status_fluxo: result.status_fluxo
                }
            });
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(409).send({ error: error.message });
        }
    };
    portar = async (request, reply) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const result = await this.service.portar(id, data);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Contrato',
                entidade_id: result.id,
                acao: 'INCLUSAO',
                dados_novos: {
                    tipo_operacao: 'PORTABILIDADE',
                    contrato_origem_id: id,
                    status_fluxo: result.status_fluxo
                }
            });
            return reply.status(201).send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('permitida')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };
}
exports.ConsignacoesController = ConsignacoesController;
