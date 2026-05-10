import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { ProdutosService } from './produtos.service';
import { AuditService } from '../audit/audit.service';

export class ProdutosController {
    private service = new ProdutosService();

    /**
     * Lista produtos com filtros e paginação
     */
    public listar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const query = request.query as any;
            const result = await this.service.listar(query);
            return reply.send(result);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    };

    /**
     * Busca um produto específico por ID
     */
    public buscarPorId = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await this.service.buscarPorId(id);
            return reply.send(result);
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };

    /**
     * Cria um novo produto
     */
    public criar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = request.body as any;
            const result = await this.service.criar(data);

            // Registrar auditoria
            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
            const statusCode = error.message.includes('não encontrada') ? 400 :
                error.message.includes('inválido') ? 400 : 500;
            return reply.status(statusCode).send({ error: error.message });
        }
    };

    /**
     * Atualiza um produto existente
     */
    public atualizar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const data = request.body as any;

            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.atualizar(id, data);

            // Registrar auditoria
            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };

    /**
     * Deleta um produto
     */
    public excluir = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };

            const anterior = await this.service.buscarPorId(id);
            await this.service.excluir(id);

            // Registrar auditoria
            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
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
