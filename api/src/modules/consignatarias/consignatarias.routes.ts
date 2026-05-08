import { FastifyInstance } from 'fastify';
import { ConsignatariasController } from './consignatarias.controller';

export async function consignatariasRoutes(app: FastifyInstance) {
    const controller = new ConsignatariasController();

    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });

    app.get('/', controller.listar);
    app.get('/:id', controller.buscarPorId);
    app.post('/', controller.criar);
    app.put('/:id', controller.atualizar);
    app.delete('/:id', controller.excluir);
}
