"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const otplib_1 = require("otplib");
describe('Auth Module — MFA E2E Tests', () => {
    let app;
    const cleanupUsuarioTeste = async (usuarioId) => {
        await database_1.prisma.logAuditoria.deleteMany({
            where: { usuario_id: usuarioId }
        });
        await database_1.prisma.usuario.delete({ where: { id: usuarioId } });
    };
    const createTestEmail = (prefix) => `${prefix}-${Date.now()}@test.com`;
    beforeAll(async () => {
        app = (0, app_1.buildApp)();
        await app.ready();
    });
    afterAll(async () => {
        await app.close();
        await database_1.prisma.$disconnect();
    });
    it('should setup, confirm and login with MFA', async () => {
        // 1. Criar usuário
        const perfil = await database_1.prisma.perfilAcesso.findFirst({ where: { nome: 'ADMINISTRADOR' } });
        const email = createTestEmail('mfaflow');
        const usuario = await database_1.prisma.usuario.create({
            data: {
                nome: 'User MFA Test',
                email,
                senha_hash: await bcryptjs_1.default.hash('password123', 10),
                perfil_id: perfil.id,
                status: 'ATIVO',
                aceitou_termos: true
            }
        });
        // 2. Login inicial para pegar token de config
        const login1 = await (0, supertest_1.default)(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'password123' });
        const configToken = login1.body.token;
        // 3. Setup MFA
        const setup = await (0, supertest_1.default)(app.server)
            .get('/v1/auth/mfa/setup')
            .set('Authorization', `Bearer ${configToken}`);
        expect(setup.status).toBe(200);
        expect(setup.body).toHaveProperty('secret');
        expect(setup.body).toHaveProperty('qrCode');
        const secret = setup.body.secret;
        // 4. Confirmar MFA com código válido
        const code = otplib_1.authenticator.generate(secret);
        const confirm = await (0, supertest_1.default)(app.server)
            .post('/v1/auth/mfa/confirm')
            .set('Authorization', `Bearer ${configToken}`)
            .send({ code });
        expect(confirm.status).toBe(200);
        // 5. Tentar login novamente (deve pedir MFA)
        const login2 = await (0, supertest_1.default)(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'password123' });
        expect(login2.status).toBe(200);
        expect(login2.body.mfa_requerido).toBe(true);
        const usuarioId = login2.body.usuarioId;
        // 6. Finalizar login com código MFA
        const finalCode = otplib_1.authenticator.generate(secret);
        const loginFinal = await (0, supertest_1.default)(app.server)
            .post('/v1/auth/login-mfa')
            .send({ usuarioId, code: finalCode });
        expect(loginFinal.status).toBe(200);
        expect(loginFinal.body).toHaveProperty('token');
        // Cleanup
        await cleanupUsuarioTeste(usuario.id);
    });
    it('should reject invalid MFA code', async () => {
        // Arrange
        const perfil = await database_1.prisma.perfilAcesso.findFirst({ where: { nome: 'ADMINISTRADOR' } });
        const email = createTestEmail('mfafail');
        const secret = otplib_1.authenticator.generateSecret();
        const usuario = await database_1.prisma.usuario.create({
            data: {
                nome: 'User MFA Fail',
                email,
                senha_hash: await bcryptjs_1.default.hash('password123', 10),
                perfil_id: perfil.id,
                status: 'ATIVO',
                mfa_habilitado: true,
                mfa_secret: secret
            }
        });
        // Act
        const response = await (0, supertest_1.default)(app.server)
            .post('/v1/auth/login-mfa')
            .send({ usuarioId: usuario.id, code: '000000' });
        // Assert
        expect(response.status).toBe(401);
        expect(response.body.error).toContain('inválido');
        // Cleanup
        await cleanupUsuarioTeste(usuario.id);
    });
});
