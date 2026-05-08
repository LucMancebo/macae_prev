import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Auth Module — E2E Tests', () => {
    let app: any;

    const cleanupUsuarioTeste = async (usuarioId: string) => {
        await prisma.logAuditoria.deleteMany({
            where: { usuario_id: usuarioId }
        });

        await prisma.usuario.delete({ where: { id: usuarioId } });
    };

    const createTestEmail = (prefix: string) =>
        `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    describe('POST /v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            // Arrange: Criar usuário de teste
            const perfil = await prisma.perfilAcesso.findFirst({
                where: { nome: 'ADMINISTRADOR' }
            });

            const email = createTestEmail('loginok');

            const usuarioTeste = await prisma.usuario.create({
                data: {
                    nome: 'Teste Login OK',
                    email,
                    senha_hash: await bcrypt.hash('senha_correta', 10),
                    perfil_id: perfil!.id,
                    status: 'ATIVO',
                    aceitou_termos: true
                }
            });

            // Act
            const response = await request(app.server)
                .post('/v1/auth/login')
                .send({
                    email,
                    senha: 'senha_correta'
                });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token).toBe('string');

            // Cleanup
            await cleanupUsuarioTeste(usuarioTeste.id);
        });

        it('should return 401 with wrong password', async () => {
            // Arrange: Criar usuário de teste
            const perfil = await prisma.perfilAcesso.findFirst({
                where: { nome: 'ADMINISTRADOR' }
            });

            const email = createTestEmail('wrongpwd');

            const usuarioTeste = await prisma.usuario.create({
                data: {
                    nome: 'Teste Wrong Password',
                    email,
                    senha_hash: await bcrypt.hash('senha_correta', 10),
                    perfil_id: perfil!.id,
                    status: 'ATIVO',
                    tentativas_login: 0,
                    aceitou_termos: true
                }
            });

            // Act
            const response = await request(app.server)
                .post('/v1/auth/login')
                .send({
                    email,
                    senha: 'senha_errada'
                });

            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');

            // Verify tentativas_login was incremented
            const usuarioAtualizado = await prisma.usuario.findUnique({
                where: { id: usuarioTeste.id }
            });
            expect(usuarioAtualizado?.tentativas_login).toBe(1);

            // Cleanup
            await cleanupUsuarioTeste(usuarioTeste.id);
        });

        it('should block user after 5 failed attempts', async () => {
            // Arrange
            const perfil = await prisma.perfilAcesso.findFirst({
                where: { nome: 'ADMINISTRADOR' }
            });

            const email = createTestEmail('ratelimit');

            const usuarioTeste = await prisma.usuario.create({
                data: {
                    nome: 'Teste Rate Limit',
                    email,
                    senha_hash: await bcrypt.hash('senha_correta', 10),
                    perfil_id: perfil!.id,
                    status: 'ATIVO',
                    tentativas_login: 0,
                    aceitou_termos: true
                }
            });

            // Act: Fazer 5 tentativas erradas
            for (let i = 0; i < 5; i++) {
                await request(app.server)
                    .post('/v1/auth/login')
                    .send({
                        email,
                        senha: 'senha_errada'
                    });
            }

            // Assert: 6ª tentativa deve retornar erro de bloqueio
            const response = await request(app.server)
                .post('/v1/auth/login')
                .send({
                    email,
                    senha: 'senha_correta' // Mesmo com senha correta
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toContain('bloqueado');

            // Verify bloqueado_ate is set
            const usuarioAtualizado = await prisma.usuario.findUnique({
                where: { id: usuarioTeste.id }
            });
            expect(usuarioAtualizado?.bloqueado_ate).not.toBeNull();
            expect(usuarioAtualizado?.tentativas_login).toBe(5);

            // Cleanup
            await cleanupUsuarioTeste(usuarioTeste.id);
        });

        it('should reset attempts on successful login', async () => {
            // Arrange
            const perfil = await prisma.perfilAcesso.findFirst({
                where: { nome: 'ADMINISTRADOR' }
            });

            const email = createTestEmail('resetattempts');

            const usuarioTeste = await prisma.usuario.create({
                data: {
                    nome: 'Teste Reset Attempts',
                    email,
                    senha_hash: await bcrypt.hash('senha_correta', 10),
                    perfil_id: perfil!.id,
                    status: 'ATIVO',
                    tentativas_login: 3,
                    aceitou_termos: true
                }
            });

            // Act: Fazer login com senha correta
            const response = await request(app.server)
                .post('/v1/auth/login')
                .send({
                    email,
                    senha: 'senha_correta'
                });

            // Assert
            expect(response.status).toBe(200);

            // Verify tentativas_login was reset
            const usuarioAtualizado = await prisma.usuario.findUnique({
                where: { id: usuarioTeste.id }
            });
            expect(usuarioAtualizado?.tentativas_login).toBe(0);
            expect(usuarioAtualizado?.bloqueado_ate).toBeNull();

            // Cleanup
            await cleanupUsuarioTeste(usuarioTeste.id);
        });

        it('should return 400 if email or password is missing', async () => {
            // Act & Assert: Sem email
            let response = await request(app.server)
                .post('/v1/auth/login')
                .send({
                    senha: 'senha_correta'
                });
            expect(response.status).toBe(400);

            // Act & Assert: Sem senha
            response = await request(app.server)
                .post('/v1/auth/login')
                .send({
                    email: 'test@test.com'
                });
            expect(response.status).toBe(400);
        });
    });

    describe('GET /v1/auth/me', () => {
        it('should return user info with valid JWT', async () => {
            // Arrange: Criar usuário e fazer login
            const perfil = await prisma.perfilAcesso.findFirst({
                where: { nome: 'ADMINISTRADOR' }
            });

            const email = createTestEmail('metest');

            const usuarioTeste = await prisma.usuario.create({
                data: {
                    nome: 'Teste Me Endpoint',
                    email,
                    senha_hash: await bcrypt.hash('senha_correta', 10),
                    perfil_id: perfil!.id,
                    status: 'ATIVO',
                    aceitou_termos: true
                }
            });

            const loginResponse = await request(app.server)
                .post('/v1/auth/login')
                .send({
                    email,
                    senha: 'senha_correta'
                });

            const token = loginResponse.body.token;

            // Act
            const response = await request(app.server)
                .get('/v1/auth/me')
                .set('Authorization', `Bearer ${token}`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user.email).toBe(email);

            // Cleanup
            await cleanupUsuarioTeste(usuarioTeste.id);
        });

        it('should return 401 without JWT', async () => {
            // Act
            const response = await request(app.server).get('/v1/auth/me');

            // Assert
            expect(response.status).toBe(401);
        });
    });

    describe('GET /health', () => {
        it('should return OK status', async () => {
            // Act
            const response = await request(app.server).get('/health');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
        });
    });
});
