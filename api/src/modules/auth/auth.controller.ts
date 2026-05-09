import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/database';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
};

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public getPerfis = async (request: FastifyRequest, reply: FastifyReply) => {
        const perfis = await prisma.perfilAcesso.findMany({
            orderBy: { nome: 'asc' }
        });
        return reply.send(perfis);
    };

    public login = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { email, senha } = request.body as any;

            if (!email || !senha) {
                return reply
                    .status(400)
                    .send({ error: 'E-mail e senha são obrigatórios' });
            }

            const result = await this.authService.autenticar(
                email,
                senha,
                request.server
            );

            if (result.mfa_requerido) {
                return reply.send({
                    message: 'MFA requerido',
                    mfa_requerido: true,
                    usuarioId: result.usuarioId
                });
            }

            if (result.termos_requeridos) {
                reply.setCookie('macae_prev_token', result.token, cookieOptions);
                return reply.send({
                    message: 'Aceite de termos LGPD requerido',
                    termos_requeridos: true,
                    token_livre: false,
                    usuarioId: result.usuarioId
                });
            }

            await AuditService.registrar(request, {
                usuario_id: result.usuarioId,
                entidade: 'Usuario',
                entidade_id: result.usuarioId,
                acao: 'LOGIN',
                dados_novos: { email }
            });

            reply.setCookie('macae_prev_token', result.token, cookieOptions);
            return reply.send({ token: result.token, token_livre: false });
        } catch (error: any) {
            request.server.log.error(error);
            return reply
                .status(error?.statusCode || 401)
                .send({ error: error.message || 'Falha na autenticação' });
        }
    };

    public getTerms = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const termo = await this.authService.getTermoAtual();
            return reply.send(termo);
        } catch (error: any) {
            return reply.status(500).send({ error: 'Erro ao buscar termos de uso' });
        }
    };

    public acceptTerms = async (request: FastifyRequest, reply: FastifyReply) => {
        const { usuarioId, termoId } = request.body as any;

        if (!usuarioId || !termoId) {
            return reply.status(400).send({ error: 'ID do usuário e ID do termo são obrigatórios' });
        }

        try {
            await this.authService.aceitarTermos(usuarioId, termoId, request);

            await AuditService.registrar(request, {
                usuario_id: usuarioId,
                entidade: 'Usuario',
                entidade_id: usuarioId,
                acao: 'ALTERACAO',
                dados_novos: { lgpd_consent: true, termo_id: termoId }
            });

            return reply.send({ message: 'Termos aceitos com sucesso' });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    };

    public loginMfa = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { usuarioId, code } = request.body as any;

            if (!usuarioId || !code) {
                return reply.status(400).send({ error: 'ID do usuário e código MFA são obrigatórios' });
            }

            const { token } = await this.authService.verificarMfa(usuarioId, code, request.server);

            await AuditService.registrar(request, {
                usuario_id: usuarioId,
                entidade: 'Usuario',
                entidade_id: usuarioId,
                acao: 'LOGIN_MFA',
                dados_novos: { usuarioId }
            });

            reply.setCookie('macae_prev_token', token, cookieOptions);
            return reply.send({ token });
        } catch (error: any) {
            return reply.status(401).send({ error: error.message });
        }
    };

    public generateMfa = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id: usuarioId } = (request as any).user;
            const result = await this.authService.configurarMfa(usuarioId);
            return reply.send(result);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    };

    public confirmMfa = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id: usuarioId } = (request as any).user;
            const { code } = request.body as any;

            if (!code) {
                return reply.status(400).send({ error: 'Código é obrigatório' });
            }

            await this.authService.confirmarConfiguracaoMfa(usuarioId, code);

            await AuditService.registrar(request, {
                usuario_id: usuarioId,
                entidade: 'Usuario',
                entidade_id: usuarioId,
                acao: 'MFA_ENABLE',
                dados_novos: { usuarioId }
            });

            return reply.send({ message: 'MFA ativado com sucesso' });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    };

    public me = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;
        return reply.send({ user });
    };

    public logout = async (request: FastifyRequest, reply: FastifyReply) => {
        reply.clearCookie('macae_prev_token', cookieOptions);
        return reply.send({ message: 'Logout realizado com sucesso' });
    };
}
