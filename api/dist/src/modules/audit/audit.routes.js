"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRoutes = auditRoutes;
const audit_service_1 = require("./audit.service");
async function auditRoutes(app) {
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });
    app.get('/:entidade/:id', async (request, reply) => {
        const { entidade, id } = request.params;
        const logs = await audit_service_1.AuditService.buscarPorEntidade(entidade, id);
        return reply.send(logs);
    });
}
