import { FastifyRequest, FastifyReply } from 'fastify';
import { MargensService } from './margens.service';
import { AuditService } from '../audit/audit.service';

export class MargensController {
    private service = new MargensService();

    /**
     * Lista margens com filtros e paginação
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
     * Busca uma margem específica por ID
     */
    public buscarPorId = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await this.service.buscarPorId(id);
            return reply.send(result);
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };

    /**
     * Consulta a disponibilidade de uma margem
     */
    public consultarDisponibilidade = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await this.service.consultarDisponibilidade(id);
            return reply.send(result);
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };

    /**
     * Cria uma nova margem
     */
    public criar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = request.body as any;
            const result = await this.service.criar(data);

            // Registrar auditoria
            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    };

    /**
     * Atualiza uma margem existente
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
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };

    /**
     * Deleta uma margem
     */
    public excluir = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };

            const anterior = await this.service.buscarPorId(id);
            await this.service.excluir(id);

            // Registrar auditoria
            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
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
