import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthController } from './auth.controller';
import { loginSchema, loginMfaSchema, acceptTermsSchema } from './auth.schema';

export async function authRoutes(app: FastifyInstance) {
    const authController = new AuthController();

    // Hook de autenticação reutilizável
    const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            return reply.status(401).send({
                error: 'Não autorizado',
                message: 'Token inválido ou expirado. Por favor, realize o login novamente.'
            });
        }
    };

    // Rotas Públicas
    app.post('/login', { schema: loginSchema }, authController.login);
    app.post('/login-mfa', { schema: loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);

    // Rotas Protegidas
    app.post('/accept-terms', { preValidation: [authenticate], schema: acceptTermsSchema }, authController.acceptTerms);
    app.get('/perfis', { preValidation: [authenticate] }, authController.getPerfis);

    // Informações do usuário logado
    app.get('/me', { preValidation: [authenticate] }, authController.me);

    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', { preValidation: [authenticate] }, authController.generateMfa);
    app.post('/mfa/confirm', { preValidation: [authenticate] }, authController.confirmMfa);
}
