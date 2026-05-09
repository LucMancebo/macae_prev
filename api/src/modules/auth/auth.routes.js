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
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Sessão inválida ou expirada. Por favor, realize o login novamente.',
                code: 'FALHA_AUTENTICACAO'
            });
        }
    };
    // --- ROTAS PÚBLICAS ---
    app.post('/login', {
        schema: auth_schema_1.loginSchema,
    }, authController.login);
    app.post('/logout', authController.logout);
    app.post('/login-mfa', { schema: auth_schema_1.loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);
    // --- ROTAS PROTEGIDAS ---
    // Rota usada pelo AuthContext para validar se o usuário ainda está logado
    app.get('/me', { preValidation: [authenticate] }, authController.me);
    app.post('/accept-terms', {
        schema: auth_schema_1.acceptTermsSchema,
        preHandler: [authenticate]
    }, authController.acceptTerms);
    app.get('/perfis', { preValidation: [authenticate] }, authController.getPerfis);
    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', { preValidation: [authenticate] }, authController.generateMfa);
    app.post('/mfa/confirm', { preValidation: [authenticate] }, authController.confirmMfa);
}
