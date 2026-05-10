import { FastifyInstance } from 'fastify';
import { ProdutosController } from './produtos.controller';

export async function produtosRoutes(app: FastifyInstance) {
    const controller = new ProdutosController();

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
    app.post('/', controller.criar);
    app.put('/:id', controller.atualizar);
    app.delete('/:id', controller.excluir);
}
