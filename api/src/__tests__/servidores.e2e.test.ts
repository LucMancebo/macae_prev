import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Servidores Module — E2E Tests', () => {
    let app: any;
    let token: string;
    let testUserId: string;

    const createTestEmail = (prefix: string) =>
        `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();

        // Cria um usuário de teste com termos já aceitos
        const perfil = await prisma.perfilAcesso.findFirst({
            where: { nome: 'ADMINISTRADOR' }
        });

        const email = createTestEmail('servidores-e2e');
        const usuario = await prisma.usuario.create({
            data: {
                nome: 'Teste Servidores E2E',
                email,
                senha_hash: await bcrypt.hash('senha_teste_123', 10),
                perfil_id: perfil!.id,
                status: 'ATIVO',
                aceitou_termos: true // Já aceita termos para evitar fluxo de LGPD
            }
        });

        testUserId = usuario.id;

        // Faz login para obter token
        const login = await request(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'senha_teste_123' });

        expect(login.status).toBe(200);
        expect(login.body).toHaveProperty('token');
        token = login.body.token;
    });

    afterAll(async () => {
        // Cleanup: Remove usuário de teste
        if (testUserId) {
            await prisma.logAuditoria.deleteMany({
                where: { usuario_id: testUserId }
            });
            await prisma.usuario.delete({ where: { id: testUserId } });
        }

        await app.close();
        await prisma.$disconnect();
    });

    it('should create a new servidor with valid data', async () => {
        const matricula = `MAT-${Date.now()}`;

        const response = await request(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Servidor Teste E2E',
                cpf: '52998224725', // CPF matematicamente válido
                matricula,
                cargo: 'ANALISTA',
                situacao_funcional: 'ATIVO',
                data_admissao: '2020-01-01',
                remuneracao_bruta: 5000.00,
                status: 'ATIVO'
            });

        expect(response.status).toBe(201);
        expect(response.body.nome).toBe('Servidor Teste E2E');
        expect(response.body.cpf).toBe('52998224725');

        // Cleanup
        await prisma.servidor.delete({ where: { id: response.body.id } });
    });

    it('should reject invalid CPF', async () => {
        const response = await request(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Servidor Erro CPF',
                cpf: '11111111111', // Todos dígitos iguais = inválido
                matricula: `MAT-ERR-${Date.now()}`,
                cargo: 'DEV',
                situacao_funcional: 'ATIVO',
                data_admissao: '2020-01-01',
                remuneracao_bruta: 1000,
                status: 'ATIVO'
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBeDefined();
    });

    it('should reject duplicate CPF', async () => {
        const cpf = '52998224725';
        const matricula1 = `MAT-${Date.now()}`;
        const matricula2 = `MAT-${Date.now() + 1}`;

        // Cria primeiro servidor
        const response1 = await request(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Servidor 1',
                cpf,
                matricula: matricula1,
                cargo: 'ANALISTA',
                situacao_funcional: 'ATIVO',
                data_admissao: '2020-01-01',
                remuneracao_bruta: 5000,
                status: 'ATIVO'
            });

        expect(response1.status).toBe(201);

        // Tenta criar segundo com mesmo CPF
        const response2 = await request(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Servidor 2',
                cpf, // Mesmo CPF
                matricula: matricula2,
                cargo: 'ANALISTA',
                situacao_funcional: 'ATIVO',
                data_admissao: '2020-01-01',
                remuneracao_bruta: 5000,
                status: 'ATIVO'
            });

        expect(response2.status).toBeGreaterThanOrEqual(400);

        // Cleanup
        await prisma.servidor.delete({ where: { id: response1.body.id } });
    });

    it('should reject duplicate matricula', async () => {
        const matricula = `MAT-${Date.now()}`;

        // Cria primeiro servidor
        const response1 = await request(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Servidor 1',
                cpf: '52998224725',
                matricula,
                cargo: 'ANALISTA',
                situacao_funcional: 'ATIVO',
                data_admissao: '2020-01-01',
                remuneracao_bruta: 5000,
                status: 'ATIVO'
            });

        expect(response1.status).toBe(201);

        // Tenta criar segundo com mesma matrícula
        const response2 = await request(app.server)
            .post('/v1/servidores')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Servidor 2',
                cpf: '04823979073', // CPF diferente
                matricula, // Mesma matrícula
                cargo: 'ANALISTA',
                situacao_funcional: 'ATIVO',
                data_admissao: '2020-01-01',
                remuneracao_bruta: 5000,
                status: 'ATIVO'
            });

        expect(response2.status).toBeGreaterThanOrEqual(400);

        // Cleanup
        await prisma.servidor.delete({ where: { id: response1.body.id } });
    });

    it('should return 401 without authorization token', async () => {
        const response = await request(app.server)
            .post('/v1/servidores')
            .send({
                nome: 'Servidor Sem Token',
                cpf: '52998224725',
                matricula: `MAT-${Date.now()}`,
                cargo: 'ANALISTA',
                situacao_funcional: 'ATIVO',
                data_admissao: '2020-01-01',
                remuneracao_bruta: 5000,
                status: 'ATIVO'
            });

        expect(response.status).toBe(401);
    });

    it('should list servidores with pagination', async () => {
        // Cria alguns servidores
        const servidores = [];
        for (let i = 0; i < 3; i++) {
            const response = await request(app.server)
                .post('/v1/servidores')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nome: `Servidor Lista ${i}`,
                    cpf: `${10000000000 + i}`.substring(0, 11),
                    matricula: `MAT-LIST-${Date.now()}-${i}`,
                    cargo: 'ANALISTA',
                    situacao_funcional: 'ATIVO',
                    data_admissao: '2020-01-01',
                    remuneracao_bruta: 5000,
                    status: 'ATIVO'
                });
            if (response.status === 201) {
                servidores.push(response.body.id);
            }
        }

        // Lista todos os servidores
        const listResponse = await request(app.server)
            .get('/v1/servidores')
            .set('Authorization', `Bearer ${token}`);

        expect(listResponse.status).toBe(200);
        expect(Array.isArray(listResponse.body.data || listResponse.body)).toBe(true);

        // Cleanup
        for (const id of servidores) {
            await prisma.servidor.delete({ where: { id } });
        }
    });
});
