import bcrypt from 'bcryptjs';
import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../config/database';

describe('Consignacoes Module — E2E Tests', () => {
    let app: any;
    let token: string;

    let testUserId: string;
    let servidorId: string;
    let margemId: string;
    let consignatariaAId: string;
    let consignatariaBId: string;
    let produtoAId: string;
    let produtoBId: string;

    const contratosCriados: string[] = [];

    const randomDigits = (size: number): string => {
        let value = '';
        while (value.length < size) {
            value += Math.floor(Math.random() * 10).toString();
        }
        return value.slice(0, size);
    };

    const createTestEmail = (prefix: string) =>
        `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();

        const perfil = await prisma.perfilAcesso.findFirst({ where: { nome: 'ADMINISTRADOR' } });

        const email = createTestEmail('consignacoes-e2e');
        const user = await prisma.usuario.create({
            data: {
                nome: 'Teste Consignacoes E2E',
                email,
                senha_hash: await bcrypt.hash('senha_teste_123', 10),
                perfil_id: perfil!.id,
                status: 'ATIVO',
                aceitou_termos: true
            }
        });
        testUserId = user.id;

        const login = await request(app.server)
            .post('/v1/auth/login')
            .send({ email, senha: 'senha_teste_123' });

        expect(login.status).toBe(200);
        token = login.body.token;

        margemId = (
            await prisma.margem.create({
                data: {
                    nome: 'Margem Consignacoes E2E',
                    tipo: 'COMPARTILHADA',
                    percentual_maximo: 40,
                    status: 'ATIVA'
                }
            })
        ).id;

        consignatariaAId = (
            await prisma.consignataria.create({
                data: {
                    razao_social: `Consig A ${Date.now()}`,
                    cnpj: randomDigits(14),
                    tipo: 'BANCO',
                    status: 'ATIVA'
                }
            })
        ).id;

        consignatariaBId = (
            await prisma.consignataria.create({
                data: {
                    razao_social: `Consig B ${Date.now()}`,
                    cnpj: randomDigits(14),
                    tipo: 'BANCO',
                    status: 'ATIVA'
                }
            })
        ).id;

        produtoAId = (
            await prisma.produto.create({
                data: {
                    nome: 'Produto A Consignacoes',
                    tipo: 'EMPRESTIMO',
                    tipo_desconto: 'PERCENTUAL',
                    margem_id: margemId,
                    consignataria_id: consignatariaAId,
                    juros_minimo: 0.5,
                    juros_maximo: 3.0,
                    prazo_minimo: 6,
                    prazo_maximo: 84,
                    parcelas_maximo: 84,
                    status: 'ATIVO'
                }
            })
        ).id;

        produtoBId = (
            await prisma.produto.create({
                data: {
                    nome: 'Produto B Portabilidade',
                    tipo: 'EMPRESTIMO',
                    tipo_desconto: 'PERCENTUAL',
                    margem_id: margemId,
                    consignataria_id: consignatariaBId,
                    juros_minimo: 0.5,
                    juros_maximo: 3.0,
                    prazo_minimo: 6,
                    prazo_maximo: 84,
                    parcelas_maximo: 84,
                    status: 'ATIVO'
                }
            })
        ).id;

        servidorId = (
            await prisma.servidor.create({
                data: {
                    nome: 'Servidor Consignacoes Teste',
                    cpf: randomDigits(11),
                    matricula: `MAT-CSN-${Date.now()}`,
                    cargo: 'ANALISTA',
                    situacao_funcional: 'ATIVO',
                    data_admissao: new Date('2020-01-01'),
                    remuneracao_bruta: 10000,
                    status: 'ATIVO'
                }
            })
        ).id;

        await prisma.margemServidor.create({
            data: {
                servidor_id: servidorId,
                margem_id: margemId,
                valor_total: 1000,
                valor_utilizado: 0,
                valor_reservado: 0,
                valor_disponivel: 1000,
                competencia_base: '2026-05'
            }
        });
    });

    afterAll(async () => {
        if (contratosCriados.length > 0) {
            await prisma.parcela.deleteMany({ where: { contrato_id: { in: contratosCriados } } });
            await prisma.contrato.deleteMany({ where: { id: { in: contratosCriados } } });
        }

        if (servidorId && margemId) {
            await prisma.margemServidor.deleteMany({
                where: {
                    servidor_id: servidorId,
                    margem_id: margemId
                }
            });
        }

        if (servidorId) {
            await prisma.servidor.deleteMany({ where: { id: servidorId } });
        }

        if (produtoAId) {
            await prisma.produto.deleteMany({ where: { id: produtoAId } });
        }

        if (produtoBId) {
            await prisma.produto.deleteMany({ where: { id: produtoBId } });
        }

        if (consignatariaAId) {
            await prisma.consignataria.deleteMany({ where: { id: consignatariaAId } });
        }

        if (consignatariaBId) {
            await prisma.consignataria.deleteMany({ where: { id: consignatariaBId } });
        }

        if (margemId) {
            await prisma.margem.deleteMany({ where: { id: margemId } });
        }

        if (testUserId) {
            await prisma.logAuditoria.deleteMany({ where: { usuario_id: testUserId } });
            await prisma.usuario.deleteMany({ where: { id: testUserId } });
        }

        await app.close();
        await prisma.$disconnect();
    });

    it('E2E-CSN-01: should create consignacao with status SOLICITADA', async () => {
        const response = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 10000,
                taxa_juros: 1.2,
                quantidade_parcelas: 24,
                data_inicio: '2026-06-01'
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('PENDENTE');
        expect(response.body.status_fluxo).toBe('SOLICITADA');
        expect(Number(response.body.cet)).toBeGreaterThan(1.2);

        contratosCriados.push(response.body.id);
    });

    it('E2E-CSN-02: should reject servidor inexistente', async () => {
        const response = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: '00000000-0000-0000-0000-000000000000',
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 8000,
                taxa_juros: 1.2,
                quantidade_parcelas: 24
            });

        expect(response.status).toBe(400);
    });

    it('E2E-CSN-03: should reject when margem is insuficiente', async () => {
        const margemExtra = await prisma.margem.create({
            data: {
                nome: `Margem Extra ${Date.now()}`,
                tipo: 'EXCLUSIVA',
                percentual_maximo: 10,
                status: 'ATIVA'
            }
        });

        const produtoExtra = await prisma.produto.create({
            data: {
                nome: `Produto Margem Baixa ${Date.now()}`,
                tipo: 'EMPRESTIMO',
                tipo_desconto: 'PERCENTUAL',
                margem_id: margemExtra.id,
                consignataria_id: consignatariaAId,
                juros_minimo: 0.5,
                juros_maximo: 3.0,
                prazo_minimo: 6,
                prazo_maximo: 84,
                status: 'ATIVO'
            }
        });

        await prisma.margemServidor.create({
            data: {
                servidor_id: servidorId,
                margem_id: margemExtra.id,
                valor_total: 50,
                valor_utilizado: 0,
                valor_reservado: 0,
                valor_disponivel: 50,
                competencia_base: '2026-05'
            }
        });

        const response = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoExtra.id,
                valor_solicitado: 10000,
                taxa_juros: 1.2,
                quantidade_parcelas: 12
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Margem insuficiente');

        await prisma.margemServidor.deleteMany({
            where: { servidor_id: servidorId, margem_id: margemExtra.id }
        });
        await prisma.produto.deleteMany({ where: { id: produtoExtra.id } });
        await prisma.margem.deleteMany({ where: { id: margemExtra.id } });
    });

    it('E2E-CSN-04/05/06: should aprovar, ativar and generate parcelas', async () => {
        const createResponse = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 6000,
                taxa_juros: 1.1,
                quantidade_parcelas: 12
            });

        expect(createResponse.status).toBe(201);
        const consignacaoId = createResponse.body.id;
        contratosCriados.push(consignacaoId);

        const aprovarResponse = await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/aprovar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(aprovarResponse.status).toBe(200);
        expect(aprovarResponse.body.status_fluxo).toBe('APROVADA');

        const ativarResponse = await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/ativar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(ativarResponse.status).toBe(200);
        expect(ativarResponse.body.status_fluxo).toBe('ATIVA');

        const parcelasResponse = await request(app.server)
            .get(`/v1/consignacoes/${consignacaoId}/parcelas`)
            .set('Authorization', `Bearer ${token}`);

        expect(parcelasResponse.status).toBe(200);
        expect(parcelasResponse.body.total).toBe(12);
    });

    it('E2E-CSN-07: should quitar consignacao ativa', async () => {
        const createResponse = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 5000,
                taxa_juros: 1.0,
                quantidade_parcelas: 10
            });

        expect(createResponse.status).toBe(201);
        const consignacaoId = createResponse.body.id;
        contratosCriados.push(consignacaoId);

        await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/aprovar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/ativar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        const quitarResponse = await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/quitar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(quitarResponse.status).toBe(200);
        expect(quitarResponse.body.status_fluxo).toBe('QUITADA');
    });

    it('E2E-CSN-E01: should reject invalid transition QUITADA -> ATIVA', async () => {
        const createResponse = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 4500,
                taxa_juros: 1.0,
                quantidade_parcelas: 9
            });

        const consignacaoId = createResponse.body.id;
        contratosCriados.push(consignacaoId);

        await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/aprovar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/ativar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/quitar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        const invalidResponse = await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/ativar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(invalidResponse.status).toBe(409);
    });

    it('E2E-CSN-08: should cancelar consignacao pendente', async () => {
        const createResponse = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 7000,
                taxa_juros: 1.0,
                quantidade_parcelas: 14
            });

        expect(createResponse.status).toBe(201);
        const consignacaoId = createResponse.body.id;
        contratosCriados.push(consignacaoId);

        const cancelResponse = await request(app.server)
            .put(`/v1/consignacoes/${consignacaoId}/cancelar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(cancelResponse.status).toBe(200);
        expect(cancelResponse.body.status_fluxo).toBe('CANCELADA');
    });

    it('E2E-CSN-10: should create portabilidade from consignacao ativa', async () => {
        const createResponse = await request(app.server)
            .post('/v1/consignacoes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 9000,
                taxa_juros: 1.1,
                quantidade_parcelas: 18
            });

        const origemId = createResponse.body.id;
        contratosCriados.push(origemId);

        await request(app.server)
            .put(`/v1/consignacoes/${origemId}/aprovar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        await request(app.server)
            .put(`/v1/consignacoes/${origemId}/ativar`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        const portResponse = await request(app.server)
            .post(`/v1/consignacoes/${origemId}/portabilidade`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                consignataria_id: consignatariaBId,
                produto_id: produtoBId,
                taxa_juros: 1.0,
                quantidade_parcelas: 20,
                valor_solicitado: 8500
            });

        expect(portResponse.status).toBe(201);
        expect(portResponse.body.status_fluxo).toBe('PORTADA');

        contratosCriados.push(portResponse.body.id);
    });

    it('E2E-CSN-E02: should return 401 without token', async () => {
        const response = await request(app.server)
            .post('/v1/consignacoes')
            .send({
                servidor_id: servidorId,
                consignataria_id: consignatariaAId,
                produto_id: produtoAId,
                valor_solicitado: 5000,
                taxa_juros: 1.0,
                quantidade_parcelas: 12
            });

        expect(response.status).toBe(401);
    });
});
