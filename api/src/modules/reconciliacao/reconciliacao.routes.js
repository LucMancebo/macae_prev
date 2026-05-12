"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconciliacaoRoutes = reconciliacaoRoutes;
const reconciliacao_controller_1 = require("./reconciliacao.controller");
async function reconciliacaoRoutes(app) {
    const controller = new reconciliacao_controller_1.ReconciliacaoController();
    const authenticateAdmin = async (request, reply) => {
        try {
            await request.jwtVerify();
            const user = request.user;
            if (user?.perfil !== 'ADMINISTRADOR') {
                return reply.status(403).send({ error: 'Acesso restrito', message: 'Somente usuários ADMINISTRADOR podem acessar a reconciliação.' });
            }
        }
        catch {
            return reply.status(401).send({ error: 'Não autorizado', message: 'Sessão inválida ou expirada.' });
        }
    };
    app.addHook('preHandler', authenticateAdmin);
    app.get('/relatorio', controller.relatorio);
}
