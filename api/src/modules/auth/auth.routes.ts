import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { loginSchema, loginMfaSchema, acceptTermsSchema } from './auth.schema';

export async function authRoutes(app: FastifyInstance) {
    const authController = new AuthController();

    app.post('/login', { schema: loginSchema }, authController.login);
    app.post('/login-mfa', { schema: loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);
    app.post('/accept-terms', { schema: acceptTermsSchema }, authController.acceptTerms);

    app.get('/perfis', authController.getPerfis);

    // Rota protegida: Informações do usuário
    app.get('/me', {
        preValidation: [async (request, reply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.status(401).send({ error: 'Token inválido ou expirado' });
            }
        }]
    }, authController.me);

    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', {
        preValidation: [async (request, reply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.status(401).send({ error: 'Token inválido ou expirado' });
            }
        }]
    }, authController.generateMfa);

    app.post('/mfa/confirm', {
        preValidation: [async (request, reply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.status(401).send({ error: 'Token inválido ou expirado' });
            }
        }]
    }, authController.confirmMfa);
}
