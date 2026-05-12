"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
describe('Consignatarias Module — E2E Tests', () => {
    let app;
    let token;
    let testUserId;
    const createTestEmail = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
    beforeAll(async () => {
        app = (0, app_1.buildApp)();
        await app.ready();
        // Cria um usuário de teste com termos já aceitos
        const perfil = await database_1.prisma.perfilAcesso.findFirst({
            where: { nome: 'ADMINISTRADOR' }
        });
        const email = createTestEmail('consignatarias-e2e');
        const usuario = await database_1.prisma.usuario.create({
            data: {
                nome: 'Teste Consignatarias E2E',
                email,
                senha_hash: await bcryptjs_1.default.hash('senha_teste_123', 10),
                perfil_id: perfil.id,
                status: 'ATIVO',
                aceitou_termos: true // Já aceita termos
            }
        });
        testUserId = usuario.id;
        // Faz login para obter token
        const login = await (0, supertest_1.default)(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'senha_teste_123' });
        expect(login.status).toBe(200);
        expect(login.body).toHaveProperty('token');
        token = login.body.token;
    });
    afterAll(async () => {
        // Cleanup: Remove usuário de teste
        if (testUserId) {
            await database_1.prisma.logAuditoria.deleteMany({
                where: { usuario_id: testUserId }
            });
            await database_1.prisma.usuario.delete({ where: { id: testUserId } });
        }
        await app.close();
        await database_1.prisma.$disconnect();
    });
    it('should create a new consignataria with valid data', async () => {
        const cnpj = '11222333000181'; // CNPJ válido
        const response = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`)
            .send({
            razao_social: 'Banco Teste E2E LTDA',
            nome_fantasia: 'Banco Teste',
            cnpj,
            tipo: 'BANCO',
            contato_email: `contato-${Date.now()}@banco-teste.com`,
            contato_telefone: '(21) 1234-5678',
            status: 'ATIVA'
        });
        expect(response.status).toBe(201);
        expect(response.body.razao_social).toBe('Banco Teste E2E LTDA');
        expect(response.body.cnpj).toBe(cnpj);
        // Cleanup
        await database_1.prisma.consignataria.delete({ where: { id: response.body.id } });
    });
    it('should reject invalid CNPJ', async () => {
        const response = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`)
            .send({
            razao_social: 'Banco Erro CNPJ',
            cnpj: '11111111111111', // Todos dígitos iguais = inválido
            tipo: 'BANCO',
            contato_email: `error-${Date.now()}@test.com`,
            status: 'ATIVA'
        });
        expect(response.status).toBeGreaterThanOrEqual(400);
    });
    it('should reject duplicate CNPJ', async () => {
        const cnpj = '11222333000181';
        // Cria primeira consignatária
        const response1 = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`)
            .send({
            razao_social: 'Banco A',
            cnpj,
            tipo: 'BANCO',
            status: 'ATIVA'
        });
        expect(response1.status).toBe(201);
        // Tenta criar segunda com mesmo CNPJ
        const response2 = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`)
            .send({
            razao_social: 'Banco B',
            cnpj, // Mesmo CNPJ
            tipo: 'BANCO',
            status: 'ATIVA'
        });
        expect(response2.status).toBeGreaterThanOrEqual(400);
        // Cleanup
        await database_1.prisma.consignataria.delete({ where: { id: response1.body.id } });
    });
    it('should reject duplicate email', async () => {
        const email = `unique-${Date.now()}@consig.com`;
        // Cria primeira consignatária
        const response1 = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`)
            .send({
            razao_social: 'Consig A',
            cnpj: '11222333000181',
            contato_email: email,
            status: 'ATIVA'
        });
        expect(response1.status).toBe(201);
        // Tenta criar segunda com mesmo email
        const response2 = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`)
            .send({
            razao_social: 'Consig B',
            cnpj: '44555666000177',
            contato_email: email, // Mesmo email
            status: 'ATIVA'
        });
        expect(response2.status).toBeGreaterThanOrEqual(400);
        // Cleanup
        await database_1.prisma.consignataria.delete({ where: { id: response1.body.id } });
    });
    it('should return 401 without authorization token', async () => {
        const response = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .send({
            razao_social: 'Banco Sem Token',
            cnpj: '11222333000181',
            status: 'ATIVA'
        });
        expect(response.status).toBe(401);
    });
    it('should list consignatarias', async () => {
        const response = await (0, supertest_1.default)(app.server)
            .get('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });
    it('should update consignataria status', async () => {
        // Cria consignatária
        const createResponse = await (0, supertest_1.default)(app.server)
            .post('/v1/consignatarias')
            .set('Authorization', `Bearer ${token}`)
            .send({
            razao_social: 'Consig Update Test',
            cnpj: '11222333000181',
            status: 'ATIVA'
        });
        expect(createResponse.status).toBe(201);
        const consigId = createResponse.body.id;
        // Atualiza status
        const updateResponse = await (0, supertest_1.default)(app.server)
            .put(`/v1/consignatarias/${consigId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
            status: 'SUSPENSA'
        });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe('SUSPENSA');
        // Cleanup
        await database_1.prisma.consignataria.delete({ where: { id: consigId } });
    });
});
