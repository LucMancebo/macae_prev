import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Margens Module — E2E Tests', () => {
    let app: any;
    let token: string;
    let testUserId: string;
    let margemId: string;

    const createTestEmail = (prefix: string) =>
        `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();

        // Cria usuário de teste
        const perfil = await prisma.perfilAcesso.findFirst({
            where: { nome: 'ADMINISTRADOR' }
        });

        const email = createTestEmail('margens-e2e');
        const usuario = await prisma.usuario.create({
            data: {
                nome: 'Teste Margens E2E',
                email,
                senha_hash: await bcrypt.hash('senha_teste_123', 10),
                perfil_id: perfil!.id,
                status: 'ATIVO',
                aceitou_termos: true
            }
        });

        testUserId = usuario.id;

        // Login
        const login = await request(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'senha_teste_123' });

        token = login.body.token;
    });

    afterAll(async () => {
        // Cleanup
        if (testUserId) {
            await prisma.logAuditoria.deleteMany({ where: { usuario_id: testUserId } });
            await prisma.usuario.delete({ where: { id: testUserId } });
        }

        // Delete any test margens
        if (margemId) {
            await prisma.margem.delete({ where: { id: margemId } }).catch(() => { });
        }

        await app.close();
        await prisma.$disconnect();
    });

    it('E2E-MARG-01: should create margem EXCLUSIVA', async () => {
        const response = await request(app.server)
            .post('/v1/margens')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Margem Exclusiva Teste',
                tipo: 'EXCLUSIVA',
                percentual_maximo: 80,
                descricao: 'Margem exclusiva para teste',
                status: 'ATIVA'
            });

        expect(response.status).toBe(201);
        expect(response.body.tipo).toBe('EXCLUSIVA');
        expect(response.body.percentual_maximo).toBe(80);

        margemId = response.body.id;
    });

    it('E2E-MARG-02: should create margem COMPARTILHADA', async () => {
        const response = await request(app.server)
            .post('/v1/margens')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Margem Compartilhada Teste',
                tipo: 'COMPARTILHADA',
                percentual_maximo: 50
            });

        expect(response.status).toBe(201);
        expect(response.body.tipo).toBe('COMPARTILHADA');
        expect(response.body.status).toBe('ATIVA');
    });

    it('E2E-MARG-03: should consult disponibilidade of a margem', async () => {
        // Create a margem first
        const createResponse = await request(app.server)
            .post('/v1/margens')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Margem Disponibilidade Teste',
                tipo: 'EXCLUSIVA',
                percentual_maximo: 60
            });

        const margem_id = createResponse.body.id;

        // Consult disponibilidade
        const disponResponse = await request(app.server)
            .get(`/v1/margens/${margem_id}/disponibilidade`)
            .set('Authorization', `Bearer ${token}`);

        expect(disponResponse.status).toBe(200);
        expect(disponResponse.body).toHaveProperty('margem_id');
        expect(disponResponse.body).toHaveProperty('total_alocado');
        expect(disponResponse.body).toHaveProperty('total_disponivel');
        expect(disponResponse.body).toHaveProperty('percentual_utilizacao');
    });

    it('E2E-MARG-04: should block (bloquear) margem', async () => {
        // Create a margem
        const createResponse = await request(app.server)
            .post('/v1/margens')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Margem Bloqueio Teste',
                tipo: 'EXCLUSIVA',
                percentual_maximo: 40
            });

        const margem_id = createResponse.body.id;

        // Update status to BLOQUEADA
        const updateResponse = await request(app.server)
            .put(`/v1/margens/${margem_id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'BLOQUEADA'
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe('BLOQUEADA');
    });

    it('E2E-MARG-05: should list margens by product', async () => {
        // Create consignataria for test
        const consig = await prisma.consignataria.create({
            data: {
                razao_social: 'Consig Margem Teste',
                cnpj: '11222333000181',
                tipo: 'BANCO',
                status: 'ATIVA'
            }
        });

        // Create margem
        const margemResponse = await request(app.server)
            .post('/v1/margens')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Margem Produto Teste',
                tipo: 'COMPARTILHADA',
                percentual_maximo: 50
            });

        const margem_id = margemResponse.body.id;

        // Create produto with this margem
        await prisma.produto.create({
            data: {
                nome: 'Produto com Margem',
                tipo: 'EMPRESTIMO',
                tipo_desconto: 'PERCENTUAL',
                consignataria_id: consig.id,
                margem_id
            }
        });

        // List margens by produto
        const listResponse = await request(app.server)
            .get(`/v1/margens?produto_id=${margem_id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(listResponse.status).toBe(200);
        expect(Array.isArray(listResponse.body.items)).toBe(true);

        // Cleanup
        await prisma.produto.deleteMany({ where: { margem_id } });
        await prisma.consignataria.delete({ where: { id: consig.id } });
    });

    it('E2E-MARG-06: should reject margem with invalid percentual', async () => {
        const response = await request(app.server)
            .post('/v1/margens')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Margem Erro Percentual',
                tipo: 'EXCLUSIVA',
                percentual_maximo: 150
            });

        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should return 401 without authorization', async () => {
        const response = await request(app.server)
            .get('/v1/margens');

        expect(response.status).toBe(401);
    });

    it('should list margens with pagination', async () => {
        const response = await request(app.server)
            .get('/v1/margens?page=1&limit=10')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('items');
        expect(response.body).toHaveProperty('meta');
        expect(response.body.meta).toHaveProperty('page');
        expect(response.body.meta).toHaveProperty('lastPage');
    });
});
