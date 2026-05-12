"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consignacoesRoutes = consignacoesRoutes;
const consignacoes_controller_1 = require("./consignacoes.controller");
async function consignacoesRoutes(app) {
    const controller = new consignacoes_controller_1.ConsignacoesController();
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (error) {
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
