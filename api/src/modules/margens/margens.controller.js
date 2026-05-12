"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MargensController = void 0;
const margens_service_1 = require("./margens.service");
const audit_service_1 = require("../audit/audit.service");
class MargensController {
    service = new margens_service_1.MargensService();
    /**
     * Lista margens com filtros e paginação
     */
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
    /**
     * Busca uma margem específica por ID
     */
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
    /**
     * Consulta a disponibilidade de uma margem
     */
    consultarDisponibilidade = async (request, reply) => {
        try {
            const { id } = request.params;
            const result = await this.service.consultarDisponibilidade(id);
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };
    /**
     * Cria uma nova margem
     */
    criar = async (request, reply) => {
        try {
            const data = request.body;
            const result = await this.service.criar(data);
            // Registrar auditoria
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Margem',
                entidade_id: result.id,
                acao: 'INCLUSAO',
                dados_novos: {
                    nome: result.nome,
                    tipo: result.tipo,
                    percentual_maximo: result.percentual_maximo,
                    status: result.status
                }
            });
            return reply.status(201).send(result);
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    };
    /**
     * Atualiza uma margem existente
     */
    atualizar = async (request, reply) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.atualizar(id, data);
            // Registrar auditoria
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Margem',
                entidade_id: result.id,
                acao: 'ALTERACAO',
                dados_anteriores: {
                    nome: anterior.nome,
                    tipo: anterior.tipo,
                    percentual_maximo: anterior.percentual_maximo,
                    status: anterior.status
                },
                dados_novos: {
                    nome: result.nome,
                    tipo: result.tipo,
                    percentual_maximo: result.percentual_maximo,
                    status: result.status
                }
            });
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };
    /**
     * Deleta uma margem
     */
    excluir = async (request, reply) => {
        try {
            const { id } = request.params;
            const anterior = await this.service.buscarPorId(id);
            await this.service.excluir(id);
            // Registrar auditoria
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Margem',
                entidade_id: id,
                acao: 'EXCLUSAO',
                dados_anteriores: {
                    nome: anterior.nome,
                    tipo: anterior.tipo,
                    status: anterior.status
                }
            });
            return reply.status(204).send();
        }
        catch (error) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('associadas')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };
}
exports.MargensController = MargensController;
