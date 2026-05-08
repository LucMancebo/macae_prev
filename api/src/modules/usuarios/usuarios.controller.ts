import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/database';
import { UsuariosService } from './usuarios.service';
import { AuditService } from '../audit/audit.service';

export class UsuariosController {
    private service = new UsuariosService();

    public listar = async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;
        const result = await this.service.listar(query);
        return reply.send(result);
    };

    public criar = async (request: FastifyRequest, reply: FastifyReply) => {
        const data = request.body as any;
        const result = await this.service.criar(data);

        await AuditService.registrar(request, {
            usuario_id: (request as any).user.id,
            entidade: 'Usuario',
            entidade_id: result.id,
            acao: 'INCLUSAO',
            dados_novos: { nome: result.nome, email: result.email, perfil_id: result.perfil_id }
        });

        return reply.status(201).send(result);
    };

    public atualizar = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = request.body as any;
        
        const anterior = await prisma.usuario.findUnique({ where: { id } });
        const result = await this.service.atualizar(id, data);

        await AuditService.registrar(request, {
            usuario_id: (request as any).user.id,
            entidade: 'Usuario',
            entidade_id: result.id,
            acao: 'ALTERACAO',
            dados_anteriores: { nome: anterior?.nome, email: anterior?.email },
            dados_novos: { nome: result.nome, email: result.email }
        });

        return reply.send(result);
    };

    public excluir = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const anterior = await prisma.usuario.findUnique({ where: { id } });
        
        await this.service.excluir(id);

        await AuditService.registrar(request, {
            usuario_id: (request as any).user.id,
            entidade: 'Usuario',
            entidade_id: id,
            acao: 'EXCLUSAO',
            dados_anteriores: { nome: anterior?.nome, email: anterior?.email }
        });

        return reply.status(204).send();
    };
}
