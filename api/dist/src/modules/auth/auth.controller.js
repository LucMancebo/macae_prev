"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = require("../../config/database");
const auth_service_1 = require("./auth.service");
const audit_service_1 = require("../audit/audit.service");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    getPerfis = async (request, reply) => {
        const perfis = await database_1.prisma.perfilAcesso.findMany({
            orderBy: { nome: 'asc' }
        });
        return reply.send(perfis);
    };
    login = async (request, reply) => {
        try {
            const { email, senha } = request.body;
            if (!email || !senha) {
                return reply
                    .status(400)
                    .send({ error: 'E-mail e senha são obrigatórios' });
            }
            const result = await this.authService.autenticar(email, senha, request.server);
            if (result.mfa_requerido) {
                return reply.send({
                    message: 'MFA requerido',
                    mfa_requerido: true,
                    usuarioId: result.usuarioId
                });
            }
            if (result.termos_requeridos) {
                return reply.send({
                    message: 'Aceite de termos LGPD requerido',
                    termos_requeridos: true,
                    usuarioId: result.usuarioId
                });
            }
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: result.usuarioId,
                entidade: 'Usuario',
                entidade_id: result.usuarioId,
                acao: 'LOGIN',
                dados_novos: { email }
            });
            return reply.send({ token: result.token });
        }
        catch (error) {
            request.server.log.error(error);
            return reply
                .status(401)
                .send({ error: error.message || 'Falha na autenticação' });
        }
    };
    getTerms = async (request, reply) => {
        try {
            const termo = await this.authService.getTermoAtual();
            return reply.send(termo);
        }
        catch (error) {
            return reply.status(500).send({ error: 'Erro ao buscar termos de uso' });
        }
    };
    acceptTerms = async (request, reply) => {
        const { usuarioId, termoId } = request.body;
        if (!usuarioId || !termoId) {
            return reply.status(400).send({ error: 'ID do usuário e ID do termo são obrigatórios' });
        }
        try {
            await this.authService.aceitarTermos(usuarioId, termoId, request);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: usuarioId,
                entidade: 'Usuario',
                entidade_id: usuarioId,
                acao: 'ALTERACAO',
                dados_novos: { lgpd_consent: true, termo_id: termoId }
            });
            return reply.send({ message: 'Termos aceitos com sucesso' });
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    };
    loginMfa = async (request, reply) => {
        try {
            const { usuarioId, code } = request.body;
            if (!usuarioId || !code) {
                return reply.status(400).send({ error: 'ID do usuário e código MFA são obrigatórios' });
            }
            const { token } = await this.authService.verificarMfa(usuarioId, code, request.server);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: usuarioId,
                entidade: 'Usuario',
                entidade_id: usuarioId,
                acao: 'LOGIN_MFA',
                dados_novos: { usuarioId }
            });
            return reply.send({ token });
        }
        catch (error) {
            return reply.status(401).send({ error: error.message });
        }
    };
    generateMfa = async (request, reply) => {
        try {
            const { id: usuarioId } = request.user;
            const result = await this.authService.configurarMfa(usuarioId);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    };
    confirmMfa = async (request, reply) => {
        try {
            const { id: usuarioId } = request.user;
            const { code } = request.body;
            if (!code) {
                return reply.status(400).send({ error: 'Código é obrigatório' });
            }
            await this.authService.confirmarConfiguracaoMfa(usuarioId, code);
            await audit_service_1.AuditService.registrar(request, {
                usuario_id: usuarioId,
                entidade: 'Usuario',
                entidade_id: usuarioId,
                acao: 'MFA_ENABLE',
                dados_novos: { usuarioId }
            });
            return reply.send({ message: 'MFA ativado com sucesso' });
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    };
    me = async (request, reply) => {
        const user = request.user;
        return reply.send({ user });
    };
}
exports.AuthController = AuthController;
