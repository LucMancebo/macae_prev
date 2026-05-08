"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const database_1 = require("../config/database");
describe('Servidores Module — E2E Tests', () => {
    let app;
    let token;
    beforeAll(async () => {
        app = (0, app_1.buildApp)();
        await app.ready();
        // Login para obter token
        const login = await (0, supertest_1.default)(app.server)
            .post('/v1/auth/login')
            .send({ email: 'admin@macaeprev.rj.gov.br', senha: '123456' });
        token = login.body.token;
        // Se precisar aceitar termos no teste
        if (login.body.termos_requeridos) {
            const terms = await (0, supertest_1.default)(app.server).get('/v1/auth/terms');
            await (0, supertest_1.default)(app.server)
                .post('/v1/auth/accept-terms')
                .send({ usuarioId: login.body.usuarioId, termoId: terms.body.id });
            const retryLogin = await (0, supertest_1.default)(app.server)
                .post('/v1/auth/login')
                .send({ email: 'admin@macaeprev.rj.gov.br', senha: '123456' });
            token = retryLogin.body.token;
        }
    });
    afterAll(async () => {
        await app.close();
        await database_1.prisma.$disconnect();
    });
    it('should create a new servidor with valid data', async () => {
        const cpf = '12345678909'; // CPF matematicamente válido para teste (pode variar conforme algoritmo)
        // Nota: Para testes, podemos usar um CPF gerado ou um que sabemos ser válido
        // Vou usar um gerador simples ou um valor fixo que passe no validador.
        const response = await (0, supertest_1.default)(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
            nome: 'Servidor Teste E2E',
            cpf: '52998224725', // CPF válido
            matricula: 'MAT-999',
            cargo: 'ANALISTA',
            situacao_funcional: 'ATIVO',
            data_admissao: '2020-01-01T00:00:00Z',
            remuneracao_bruta: 5000.00,
            status: 'ATIVO'
        });
        expect(response.status).toBe(201);
        expect(response.body.nome).toBe('Servidor Teste E2E');
        // Cleanup
        await database_1.prisma.logAuditoria.deleteMany({ where: { entidade_id: response.body.id } });
        await database_1.prisma.servidor.delete({ where: { id: response.body.id } });
    });
    it('should reject invalid CPF', async () => {
        const response = await (0, supertest_1.default)(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
            nome: 'Servidor Erro',
            cpf: '11111111111', // Inválido
            matricula: 'MAT-ERR',
            cargo: 'DEV',
            situacao_funcional: 'ATIVO',
            data_admissao: '2020-01-01T00:00:00Z',
            remuneracao_bruta: 1000,
            status: 'ATIVO'
        });
        expect(response.status).toBe(500);
        expect(response.body.error.message).toContain('CPF matematicamente inválido');
    });
});
