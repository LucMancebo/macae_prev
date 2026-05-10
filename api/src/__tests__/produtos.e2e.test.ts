import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Produtos Module — E2E Tests', () => {
    let app: any;
    let token: string;
    let testUserId: string;
    let consignatariaId: string;
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

        const email = createTestEmail('produtos-e2e');
        const usuario = await prisma.usuario.create({
            data: {
                nome: 'Teste Produtos E2E',
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

        // Cria consignatária de teste
        const consigResponse = await prisma.consignataria.create({
            data: {
                razao_social: 'Teste Produtos LTDA',
                cnpj: '11222333000181',
                tipo: 'BANCO',
                status: 'ATIVA'
            }
        });

        consignatariaId = consigResponse.id;

        // Cria margem de teste
        const margemResponse = await prisma.margem.create({
            data: {
                nome: 'Margem Teste Produtos',
                tipo: 'COMPARTILHADA',
                percentual_maximo: 50,
                status: 'ATIVA'
            }
        });

        margemId = margemResponse.id;
    });

    afterAll(async () => {
        // Cleanup
        if (testUserId) {
            await prisma.logAuditoria.deleteMany({ where: { usuario_id: testUserId } });
            await prisma.usuario.delete({ where: { id: testUserId } });
        }

        if (consignatariaId) {
            await prisma.produto.deleteMany({ where: { consignataria_id: consignatariaId } });
            await prisma.consignataria.delete({ where: { id: consignatariaId } });
        }

        if (margemId) {
            await prisma.margem.delete({ where: { id: margemId } });
        }

        await app.close();
        await prisma.$disconnect();
    });

    it('E2E-PROD-01: should list empty produtos', async () => {
        const response = await request(app.server)
            .get('/v1/produtos')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('items');
        expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('E2E-PROD-02: should create produto with valid data', async () => {
        const response = await request(app.server)
            .post('/v1/produtos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Empréstimo Consignado',
                tipo: 'EMPRESTIMO',
                tipo_desconto: 'PERCENTUAL',
                consignataria_id: consignatariaId,
                margem_id: margemId,
                juros_minimo: 0.5,
                juros_maximo: 5,
                prazo_minimo: 12,
                prazo_maximo: 60,
                parcelas_maximo: 60
            });

        expect(response.status).toBe(201);
        expect(response.body.nome).toBe('Empréstimo Consignado');
        expect(response.body.status).toBe('ATIVO');
    });

    it('E2E-PROD-03: should reject when taxa minima > taxa maxima', async () => {
        const response = await request(app.server)
            .post('/v1/produtos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Produto Erro Taxa',
                tipo: 'EMPRESTIMO',
                tipo_desconto: 'PERCENTUAL',
                consignataria_id: consignatariaId,
                margem_id: margemId,
                juros_minimo: 30,
                juros_maximo: 1
            });

        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('E2E-PROD-04: should reject prazo outside valid range', async () => {
        const response = await request(app.server)
            .post('/v1/produtos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Produto Erro Prazo',
                tipo: 'EMPRESTIMO',
                tipo_desconto: 'PERCENTUAL',
                consignataria_id: consignatariaId,
                margem_id: margemId,
                prazo_minimo: 6,
                prazo_maximo: 500
            });

        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('E2E-PROD-05: should list produtos by consignataria', async () => {
        // Criar primeiro um produto
        await request(app.server)
            .post('/v1/produtos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Produto Filtro',
                tipo: 'CARTAO',
                tipo_desconto: 'NOMINAL',
                consignataria_id: consignatariaId,
                margem_id: margemId
            });

        // Listar por consignatária
        const response = await request(app.server)
            .get(`/v1/produtos?consignataria_id=${consignatariaId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.items.length).toBeGreaterThan(0);
        expect(response.body.items[0].consignataria_id).toBe(consignatariaId);
    });

    it('E2E-PROD-06: should update produto', async () => {
        // Criar um produto
        const createResponse = await request(app.server)
            .post('/v1/produtos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Produto Update Teste',
                tipo: 'SEGURO',
                tipo_desconto: 'PERCENTUAL',
                consignataria_id: consignatariaId,
                margem_id: margemId,
                juros_minimo: 2,
                juros_maximo: 10
            });

        const produtoId = createResponse.body.id;

        // Atualizar
        const updateResponse = await request(app.server)
            .put(`/v1/produtos/${produtoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Produto Update Modificado',
                status: 'INATIVO'
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.nome).toBe('Produto Update Modificado');
        expect(updateResponse.body.status).toBe('INATIVO');
    });
});
