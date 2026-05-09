import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthController } from './auth.controller';
import { loginSchema, loginMfaSchema, acceptTermsSchema } from './auth.schema';

export async function authRoutes(app: FastifyInstance) {
    const authController = new AuthController();

    // Hook de autenticação reutilizável
    const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err: any) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Sessão inválida ou expirada. Por favor, realize o login novamente.',
                code: 'FALHA_AUTENTICACAO'
            });
        }
    };

    // --- ROTAS PÚBLICAS ---
    app.post('/login', {
        schema: loginSchema,
    }, authController.login);

    app.post('/logout', authController.logout);

    app.post('/login-mfa', { schema: loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);

    // --- ROTAS PROTEGIDAS ---
    // Rota usada pelo AuthContext para validar se o usuário ainda está logado
    app.get('/me', { preValidation: [authenticate] }, authController.me);

    app.post('/accept-terms', {
        schema: acceptTermsSchema,
        preHandler: [authenticate]
    }, authController.acceptTerms);
    app.get('/perfis', { preValidation: [authenticate] }, authController.getPerfis);

    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', { preValidation: [authenticate] }, authController.generateMfa);
    app.post('/mfa/confirm', { preValidation: [authenticate] }, authController.confirmMfa);
}
