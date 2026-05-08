import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Auth Module — LGPD E2E Tests', () => {
    let app: any;

    const cleanupUsuarioTeste = async (usuarioId: string) => {
        await prisma.aceiteTermo.deleteMany({ where: { usuario_id: usuarioId } });
        await prisma.logAuditoria.deleteMany({ where: { usuario_id: usuarioId } });
        await prisma.usuario.delete({ where: { id: usuarioId } });
    };

    beforeAll(async () => {
        app = buildApp();
        await app.ready();

        // Garantir que existe um termo de uso no banco
        await prisma.termoUso.upsert({
            where: { id: '00000000-0000-0000-0000-000000000001' },
            update: {},
            create: {
                id: '00000000-0000-0000-0000-000000000001',
                versao: '1.0',
                conteudo: 'Termos de teste LGPD para MACAEPREV',
                publicado: true
            }
        });
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('should require terms acceptance on first login', async () => {
        // 1. Criar usuário que ainda não aceitou termos
        const perfil = await prisma.perfilAcesso.findFirst({ where: { nome: 'ADMINISTRADOR' } });
        const email = `lgpd-${Date.now()}@test.com`;
        const usuario = await prisma.usuario.create({
            data: {
                nome: 'User LGPD Test',
                email,
                senha_hash: await bcrypt.hash('password123', 10),
                perfil_id: perfil!.id,
                status: 'ATIVO',
                aceitou_termos: false
            }
        });

        // 2. Tentar login
        const login = await request(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'password123' });
        
        expect(login.status).toBe(200);
        expect(login.body.termos_requeridos).toBe(true);

        // 3. Buscar termos
        const terms = await request(app.server).get('/v1/auth/terms');
        expect(terms.status).toBe(200);
        expect(terms.body).toHaveProperty('id');
        const termoId = terms.body.id;

        // 4. Aceitar termos
        const accept = await request(app.server)
            .post('/v1/auth/accept-terms')
            .send({ usuarioId: usuario.id, termoId });
        
        expect(accept.status).toBe(200);

        // 5. Login deve funcionar agora
        const loginSucesso = await request(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'password123' });
        
        expect(loginSucesso.status).toBe(200);
        expect(loginSucesso.body).toHaveProperty('token');

        // Cleanup
        await cleanupUsuarioTeste(usuario.id);
    });
});
