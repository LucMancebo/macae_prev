"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arquivosRoutes = arquivosRoutes;
const arquivo_controller_1 = require("./arquivo.controller");
async function arquivosRoutes(app) {
    const controller = new arquivo_controller_1.ArquivoController();
    const authenticateAdmin = async (request, reply) => {
        try {
            await request.jwtVerify();
            if (request.user?.perfil !== 'ADMINISTRADOR') {
                return reply.status(403).send({
                    error: 'Acesso restrito',
                    message: 'Somente usuários ADMINISTRADOR podem acessar o módulo de arquivos.'
                });
            }
        }
        catch {
            return reply.status(401).send({
                error: 'Não autorizado',
                message: 'Sessão inválida ou expirada.'
            });
        }
    };
    app.addHook('preHandler', authenticateAdmin);
    app.post('/import', controller.importarArquivo);
    app.get('/export', controller.exportarArquivos);
    app.get('/:id', controller.buscarArquivo);
}
