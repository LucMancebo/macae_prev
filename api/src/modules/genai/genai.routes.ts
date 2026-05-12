import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GenAIController } from './genai.controller';

export async function genaiRoutes(app: FastifyInstance) {
    const controller = new GenAIController();

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
    app.post('/generate', async (request: FastifyRequest, reply: FastifyReply) => {
        return controller.generate(request, reply);
    });
}
