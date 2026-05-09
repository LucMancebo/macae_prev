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

    app.post('/login', { schema: loginSchema }, authController.login);
    app.post('/login-mfa', { schema: loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);
    app.post('/accept-terms', { schema: acceptTermsSchema }, authController.acceptTerms);

    // Rota de perfis geralmente deve ser protegida
    app.get('/perfis', { preValidation: [authenticate] }, authController.getPerfis);

    // Rota protegida: Informações do usuário
    app.get('/me', { preValidation: [authenticate] }, authController.me);

    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', { preValidation: [authenticate] }, authController.generateMfa);
    app.post('/mfa/confirm', { preValidation: [authenticate] }, authController.confirmMfa);
}
