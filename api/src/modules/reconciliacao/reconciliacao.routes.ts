import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ReconciliacaoController } from './reconciliacao.controller';

export async function reconciliacaoRoutes(app: FastifyInstance) {
    const controller = new ReconciliacaoController();

    const authenticateAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();

            const user = request.user as { perfil?: string } | undefined;
            if (user?.perfil !== 'ADMINISTRADOR') {
                return reply.status(403).send({ error: 'Acesso restrito', message: 'Somente usuários ADMINISTRADOR podem acessar a reconciliação.' });
            }
        } catch {
            return reply.status(401).send({ error: 'Não autorizado', message: 'Sessão inválida ou expirada.' });
        }
    };

    app.addHook('preHandler', authenticateAdmin);

    app.get('/relatorio', controller.relatorio);
}
