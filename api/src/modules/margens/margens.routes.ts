import { FastifyInstance } from 'fastify';
import { MargensController } from './margens.controller';

export async function margensRoutes(app: FastifyInstance) {
    const controller = new MargensController();

    // Hook de autenticação para todas as rotas
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });

    app.get('/', controller.listar);
    app.get('/:id', controller.buscarPorId);
    app.get('/:id/disponibilidade', controller.consultarDisponibilidade);
    app.post('/', controller.criar);
    app.put('/:id', controller.atualizar);
    app.delete('/:id', controller.excluir);
}
