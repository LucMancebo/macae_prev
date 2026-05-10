import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuditService } from '../../audit/audit.service';

// Mock AuthService and AuditService
jest.mock('../auth.service');
jest.mock('../../audit/audit.service');

describe('AuthController', () => {
    let app: FastifyInstance;
    let authController: AuthController;

    beforeAll(() => {
        app = Fastify();
        app.register(cookie);
        authController = new AuthController();
        app.post('/login', authController.login);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email or senha is not provided', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: { email: 'test@test.com' },
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.payload)).toEqual({
            error: 'E-mail e senha são obrigatórios',
        });
    });

    it('should return 401 if authentication fails', async () => {
        (AuthService.prototype.autenticar as jest.Mock).mockRejectedValue(
            new Error('Credenciais inválidas')
        );

        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: { email: 'test@test.com', senha: 'wrong' },
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toEqual({
            error: 'Credenciais inválidas',
        });
    });

    it('should return token if authentication is successful', async () => {
        (AuthService.prototype.autenticar as jest.Mock).mockResolvedValue({
            token: 'fake-jwt-token',
            usuarioId: 'user-id-123',
        });

        (AuditService.registrar as jest.Mock).mockResolvedValue(undefined);

        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: { email: 'test@test.com', senha: 'correct' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            token: 'fake-jwt-token',
            token_livre: false,
        });

        expect(AuditService.registrar).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                usuario_id: 'user-id-123',
                acao: 'LOGIN',
            })
        );
    });
});
