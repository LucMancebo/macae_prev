import { FastifyInstance, FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { AuthController } from './auth.controller';
import { loginSchema, loginMfaSchema, acceptTermsSchema } from './auth.schema';

export async function authRoutes(app: FastifyInstance) {
    const authController = new AuthController();

    // Hook de autenticação reutilizável
    const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err: any) {
            request.server.log.warn({
                msg: 'JWT Verification Failed',
                error: err.message,
                path: request.url
            });

            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Sessão inválida ou expirada. Por favor, saia e entre novamente.',
                code: 'FALHA_AUTENTICACAO'
            });
        }
    };

    // --- ROTAS PÚBLICAS ---
    app.post('/login', { schema: loginSchema }, authController.login);
    app.post('/login-mfa', { schema: loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);

    // --- ROTAS PROTEGIDAS ---
    // Rota usada pelo AuthContext para validar se o usuário ainda está logado
    app.get('/me', { preValidation: [authenticate] }, authController.me);

    app.post('/accept-terms', { preValidation: [authenticate], schema: acceptTermsSchema }, authController.acceptTerms);
    app.get('/perfis', { preValidation: [authenticate] }, authController.getPerfis);

    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', { preValidation: [authenticate] }, authController.generateMfa);
    app.post('/mfa/confirm', { preValidation: [authenticate] }, authController.confirmMfa);
}
