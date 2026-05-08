import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../config/database';

describe('Servidores Module — E2E Tests', () => {
    let app: any;
    let token: string;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();

        // Login para obter token
        const login = await request(app.server)
            .post('/v1/auth/login')
            .send({ email: 'admin@macaeprev.rj.gov.br', senha: '123456' });
        
        token = login.body.token;
        
        // Se precisar aceitar termos no teste
        if (login.body.termos_requeridos) {
            const terms = await request(app.server).get('/v1/auth/terms');
            await request(app.server)
                .post('/v1/auth/accept-terms')
                .send({ usuarioId: login.body.usuarioId, termoId: terms.body.id });
            
            const retryLogin = await request(app.server)
                .post('/v1/auth/login')
                .send({ email: 'admin@macaeprev.rj.gov.br', senha: '123456' });
            token = retryLogin.body.token;
        }
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('should create a new servidor with valid data', async () => {
        const cpf = '12345678909'; // CPF matematicamente válido para teste (pode variar conforme algoritmo)
        // Nota: Para testes, podemos usar um CPF gerado ou um que sabemos ser válido
        // Vou usar um gerador simples ou um valor fixo que passe no validador.
        
        const response = await request(app.server)
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
        await prisma.logAuditoria.deleteMany({ where: { entidade_id: response.body.id } });
        await prisma.servidor.delete({ where: { id: response.body.id } });
    });

    it('should reject invalid CPF', async () => {
        const response = await request(app.server)
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
