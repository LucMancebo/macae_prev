import { FastifyReply, FastifyRequest } from 'fastify';
import { AuditService } from '../audit/audit.service';
import { ConsignacoesService } from './consignacoes.service';

export class ConsignacoesController {
    private service = new ConsignacoesService();

    public listar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const query = request.query as any;
            const result = await this.service.listar(query);
            return reply.send(result);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    };

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

    public listarParcelas = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await this.service.listarParcelas(id);
            return reply.send(result);
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    };

    public criar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = request.body as any;
            const result = await this.service.criar(data);

            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    };

    public aprovar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const usuarioId = (request as any).user?.id;
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.aprovar(id, usuarioId);

            await AuditService.registrar(request, {
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
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('SOLICITADAS')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };

    public ativar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.ativar(id);

            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('inválida') || error.message.includes('ATIVA') || error.message.includes('APROVADA')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    };

    public cancelar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.cancelar(id);

            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(409).send({ error: error.message });
        }
    };

    public quitar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const anterior = await this.service.buscarPorId(id);
            const result = await this.service.quitar(id);

            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
            if (error.message.includes('não encontrada')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(409).send({ error: error.message });
        }
    };

    public portar = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const data = request.body as any;
            const result = await this.service.portar(id, data);

            await AuditService.registrar(request, {
                usuario_id: (request as any).user?.id || 'sistema',
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
        } catch (error: any) {
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
