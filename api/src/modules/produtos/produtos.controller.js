"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutosController = void 0;
const produtos_service_1 = require("./produtos.service");
const audit_service_1 = require("../audit/audit.service");
class ProdutosController {
    service = new produtos_service_1.ProdutosService();
    /**
     * Lista produtos com filtros e paginação
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
     * Busca um produto específico por ID
     */
    buscarPorId = async (request, reply) => {
        try {
            const { id } = request.params;
            const result = await this.service.buscarPorId(id);
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrado')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };
    /**
     * Cria um novo produto
     */
    criar = async (request, reply) => {
        try {
            const data = request.body;
            const result = await this.service.criar(data);
            // Registrar auditoria
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Produto',
                entidade_id: result.id,
                acao: 'INCLUSAO',
                dados_novos: {
                    nome: result.nome,
                    tipo: result.tipo,
                    consignataria_id: result.consignataria_id,
                    margem_id: result.margem_id,
                    juros_minimo: result.juros_minimo,
                    juros_maximo: result.juros_maximo,
                    prazo_minimo: result.prazo_minimo,
                    prazo_maximo: result.prazo_maximo
                }
            });
            return reply.status(201).send(result);
        }
        catch (error) {
            const statusCode = error.message.includes('não encontrada') ? 400 :
                error.message.includes('inválido') ? 400 : 500;
            return reply.status(statusCode).send({ error: error.message });
        }
    };
    /**
     * Atualiza um produto existente
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
                entidade: 'Produto',
                entidade_id: result.id,
                acao: 'ALTERACAO',
                dados_anteriores: {
                    nome: anterior.nome,
                    tipo: anterior.tipo,
                    juros_minimo: anterior.juros_minimo,
                    juros_maximo: anterior.juros_maximo,
                    prazo_minimo: anterior.prazo_minimo,
                    prazo_maximo: anterior.prazo_maximo,
                    status: anterior.status
                },
                dados_novos: {
                    nome: result.nome,
                    tipo: result.tipo,
                    juros_minimo: result.juros_minimo,
                    juros_maximo: result.juros_maximo,
                    prazo_minimo: result.prazo_minimo,
                    prazo_maximo: result.prazo_maximo,
                    status: result.status
                }
            });
            return reply.send(result);
        }
        catch (error) {
            if (error.message.includes('não encontrado')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };
    /**
     * Deleta um produto
     */
    excluir = async (request, reply) => {
        try {
            const { id } = request.params;
            const anterior = await this.service.buscarPorId(id);
            await this.service.excluir(id);
            // Registrar auditoria
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: request.user?.id || 'sistema',
                entidade: 'Produto',
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
            if (error.message.includes('não encontrado')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('contratos associados')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };
}
exports.ProdutosController = ProdutosController;
