"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genaiRoutes = genaiRoutes;
const genai_controller_1 = require("./genai.controller");
async function genaiRoutes(app) {
    const controller = new genai_controller_1.GenAIController();
    // Rotas protegidas: exige autenticação
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });
    // POST /v1/genai/generate
    app.post('/generate', async (request, reply) => {
        return controller.generate(request, reply);
    });
}
