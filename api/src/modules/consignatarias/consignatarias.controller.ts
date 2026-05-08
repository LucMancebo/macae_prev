import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { ConsignatariasService } from './consignatarias.service';
import { AuditService } from '../audit/audit.service';

export class ConsignatariasController {
    private service = new ConsignatariasService();

    public listar = async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;
        const result = await this.service.listar(query);
        return reply.send(result);
    };

    public buscarPorId = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const result = await this.service.buscarPorId(id);
        return reply.send(result);
    };

    public criar = async (request: FastifyRequest, reply: FastifyReply) => {
        const data = request.body as Prisma.ConsignatariaCreateInput;
        const result = await this.service.criar(data);

        await AuditService.registrar(request, {
            usuario_id: (request as any).user.id,
            entidade: 'Consignataria',
            entidade_id: result.id,
            acao: 'INCLUSAO',
            dados_novos: result
        });

        return reply.status(201).send(result);
    };

    public atualizar = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = request.body as Prisma.ConsignatariaUpdateInput;
        
        const anterior = await this.service.buscarPorId(id);
        const result = await this.service.atualizar(id, data);

        // Limpeza de relações para o log
        const { produtos, contratos, ...dadosAnterioresLimpos } = anterior as any;
        const { produtos: p1, contratos: c1, ...dadosNovosLimpos } = result as any;

        await AuditService.registrar(request, {
            usuario_id: (request as any).user.id,
            entidade: 'Consignataria',
            entidade_id: result.id,
            acao: 'ALTERACAO',
            dados_anteriores: dadosAnterioresLimpos,
            dados_novos: dadosNovosLimpos
        });

        return reply.send(result);
    };

    public excluir = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        
        const anterior = await this.service.buscarPorId(id);
        await this.service.excluir(id);

        const { produtos, contratos, ...dadosAnterioresLimpos } = anterior as any;

        await AuditService.registrar(request, {
            usuario_id: (request as any).user.id,
            entidade: 'Consignataria',
            entidade_id: id,
            acao: 'EXCLUSAO',
            dados_anteriores: dadosAnterioresLimpos
        });

        return reply.status(204).send();
    };
}
