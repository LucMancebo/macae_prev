"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const auth_controller_1 = require("../auth.controller");
const auth_service_1 = require("../auth.service");
const audit_service_1 = require("../../audit/audit.service");
// Mock AuthService and AuditService
jest.mock('../auth.service');
jest.mock('../../audit/audit.service');
describe('AuthController', () => {
    let app;
    let authController;
    beforeAll(() => {
        app = (0, fastify_1.default)();
        app.register(cookie_1.default);
        authController = new auth_controller_1.AuthController();
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
        auth_service_1.AuthService.prototype.autenticar.mockRejectedValue(new Error('Credenciais inválidas'));
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
        auth_service_1.AuthService.prototype.autenticar.mockResolvedValue({
            token: 'fake-jwt-token',
            usuarioId: 'user-id-123',
        });
        audit_service_1.AuditService.registrar.mockResolvedValue(undefined);
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
        expect(audit_service_1.AuditService.registrar).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            usuario_id: 'user-id-123',
            acao: 'LOGIN',
        }));
    });
});
