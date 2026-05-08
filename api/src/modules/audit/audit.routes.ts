import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuditService } from './audit.service';

export async function auditRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });

    app.get('/:entidade/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { entidade, id } = request.params as { entidade: string, id: string };
        const logs = await AuditService.buscarPorEntidade(entidade, id);
        return reply.send(logs);
    });
}
