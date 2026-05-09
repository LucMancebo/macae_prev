"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_1 = require("./auth.controller");
const auth_schema_1 = require("./auth.schema");
async function authRoutes(app) {
    const authController = new auth_controller_1.AuthController();
    // Hook de autenticação reutilizável
    const authenticate = async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            return reply.status(401).send({
                error: 'Não autorizado',
                message: 'Token inválido ou expirado. Por favor, realize o login novamente.'
            });
        }
    };
    // Rotas Públicas
    app.post('/login', { schema: auth_schema_1.loginSchema }, authController.login);
    app.post('/login-mfa', { schema: auth_schema_1.loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);
    // Rotas Protegidas
    app.post('/accept-terms', { preValidation: [authenticate], schema: auth_schema_1.acceptTermsSchema }, authController.acceptTerms);
    app.get('/perfis', { preValidation: [authenticate] }, authController.getPerfis);
    // Informações do usuário logado
    app.get('/me', { preValidation: [authenticate] }, authController.me);
    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', { preValidation: [authenticate] }, authController.generateMfa);
    app.post('/mfa/confirm', { preValidation: [authenticate] }, authController.confirmMfa);
}
