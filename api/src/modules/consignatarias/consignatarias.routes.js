"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consignatariasRoutes = consignatariasRoutes;
const consignatarias_controller_1 = require("./consignatarias.controller");
async function consignatariasRoutes(app) {
    const controller = new consignatarias_controller_1.ConsignatariasController();
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });
    app.get('/', controller.listar);
    app.get('/:id', controller.buscarPorId);
    app.post('/', controller.criar);
    app.put('/:id', controller.atualizar);
    app.delete('/:id', controller.excluir);
}
