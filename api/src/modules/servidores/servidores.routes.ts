import { FastifyInstance } from 'fastify';
import { ServidoresController } from './servidores.controller';

export async function servidoresRoutes(app: FastifyInstance) {
    const controller = new ServidoresController();

    // Hook de autenticação para todas as rotas deste módulo
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
