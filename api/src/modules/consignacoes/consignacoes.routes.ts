import { FastifyInstance } from 'fastify';
import { ConsignacoesController } from './consignacoes.controller';

export async function consignacoesRoutes(app: FastifyInstance) {
    const controller = new ConsignacoesController();

    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (error) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });

    app.get('/', controller.listar);
    app.get('/:id', controller.buscarPorId);
    app.get('/:id/parcelas', controller.listarParcelas);

    app.post('/', controller.criar);
    app.put('/:id/aprovar', controller.aprovar);
    app.put('/:id/ativar', controller.ativar);
    app.put('/:id/cancelar', controller.cancelar);
    app.put('/:id/quitar', controller.quitar);

    app.post('/:id/portabilidade', controller.portar);
}
