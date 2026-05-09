"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servidoresRoutes = servidoresRoutes;
const servidores_controller_1 = require("./servidores.controller");
async function servidoresRoutes(app) {
    const controller = new servidores_controller_1.ServidoresController();
    // Hook de autenticação para todas as rotas deste módulo
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
