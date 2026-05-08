"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_1 = require("./auth.controller");
const auth_schema_1 = require("./auth.schema");
async function authRoutes(app) {
    const authController = new auth_controller_1.AuthController();
    app.post('/login', { schema: auth_schema_1.loginSchema }, authController.login);
    app.post('/login-mfa', { schema: auth_schema_1.loginMfaSchema }, authController.loginMfa);
    app.get('/terms', authController.getTerms);
    app.post('/accept-terms', { schema: auth_schema_1.acceptTermsSchema }, authController.acceptTerms);
    app.get('/perfis', authController.getPerfis);
    // Rota protegida: Informações do usuário
    app.get('/me', {
        preValidation: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                }
                catch (err) {
                    reply.status(401).send({ error: 'Token inválido ou expirado' });
                }
            }]
    }, authController.me);
    // Rotas protegidas de configuração de MFA
    app.get('/mfa/setup', {
        preValidation: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                }
                catch (err) {
                    reply.status(401).send({ error: 'Token inválido ou expirado' });
                }
            }]
    }, authController.generateMfa);
    app.post('/mfa/confirm', {
        preValidation: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                }
                catch (err) {
                    reply.status(401).send({ error: 'Token inválido ou expirado' });
                }
            }]
    }, authController.confirmMfa);
}
