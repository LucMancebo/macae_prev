"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produtosRoutes = produtosRoutes;
const produtos_controller_1 = require("./produtos.controller");
async function produtosRoutes(app) {
    const controller = new produtos_controller_1.ProdutosController();
    // Hook de autenticação para todas as rotas
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
