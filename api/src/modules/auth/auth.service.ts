import { prisma } from '../../config/database';
import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

const MAX_TENTATIVAS = Number(process.env.AUTH_MAX_TENTATIVAS) || 5;
const BLOQUEIO_MINUTOS = Number(process.env.AUTH_BLOQUEIO_MINUTOS) || 30;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export class AuthService {
    public async autenticar(
        email: string,
        senha_plana: string,
        app: FastifyInstance
    ): Promise<{ token: string; usuarioId: string; mfa_requerido?: boolean; termos_requeridos?: boolean }> {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { perfil: true }
        });

        if (!usuario) {
            throw new Error('Credenciais inválidas');
        }

        // Verificar se usuário está bloqueado por rate-limiting
        if (usuario.bloqueado_ate && usuario.bloqueado_ate > new Date()) {
            const minutosRestantes = Math.ceil(
                (usuario.bloqueado_ate.getTime() - new Date().getTime()) / 60000
            );
            throw new Error(
                `Usuário bloqueado por excesso de tentativas. Tente novamente em ${minutosRestantes} minuto(s).`
            );
        }

        if (usuario.status !== 'ATIVO') {
            throw new Error('Usuário inativo ou bloqueado');
        }

        const senhaCorreta = await bcrypt.compare(senha_plana, usuario.senha_hash);
        if (!senhaCorreta) {
            // Incrementar tentativas e verificar se deve bloquear
            const novasTentativas = usuario.tentativas_login + 1;
            const bloqueadoAte =
                novasTentativas >= MAX_TENTATIVAS
                    ? new Date(Date.now() + BLOQUEIO_MINUTOS * 60000)
                    : null;

            await prisma.usuario.update({
                where: { id: usuario.id },
                data: {
                    tentativas_login: novasTentativas,
                    bloqueado_ate: bloqueadoAte
                }
            });

            if (bloqueadoAte) {
                throw new Error(
                    `Usuário bloqueado após ${MAX_TENTATIVAS} tentativas. Tente novamente em ${BLOQUEIO_MINUTOS} minuto(s).`
                );
            }

            throw new Error('Credenciais inválidas');
        }

        // Login bem-sucedido: Verificar se MFA está habilitado
        if (usuario.mfa_habilitado) {
            return { token: '', usuarioId: usuario.id, mfa_requerido: true };
        }

        // Verificar LGPD: Aceite de termos
        if (!usuario.aceitou_termos) {
            const tokenTemporario = this.gerarToken(usuario, app);
            return { token: tokenTemporario, usuarioId: usuario.id, termos_requeridos: true };
        }

        // Se não tiver MFA nem pendência de termos, reseta tentativas e gera token final
        await this.resetarTentativas(usuario.id);

        const token = this.gerarToken(usuario, app);

        return { token, usuarioId: usuario.id };
    }

    public async verificarMfa(
        usuarioId: string,
        token_mfa: string,
        app: FastifyInstance
    ): Promise<{ token: string }> {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            include: { perfil: true }
        });

        if (!usuario || !usuario.mfa_secret) {
            throw new Error('MFA não configurado para este usuário');
        }

        const isValid = authenticator.check(token_mfa, usuario.mfa_secret);

        if (!isValid) {
            throw new Error('Código MFA inválido');
        }

        // Resetar tentativas após validação MFA bem-sucedida
        await this.resetarTentativas(usuario.id);

        const token = this.gerarToken(usuario, app);
        return { token };
    }

    public async configurarMfa(usuarioId: string): Promise<{ secret: string; qrCode: string }> {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuario) throw new Error('Usuário não encontrado');

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(usuario.email, 'MACAEPREV', secret);
        const qrCode = await qrcode.toDataURL(otpauth);

        // Salvar o secret (ainda desabilitado até o usuário confirmar com o primeiro código)
        await prisma.usuario.update({
            where: { id: usuarioId },
            data: { mfa_secret: secret }
        });

        return { secret, qrCode };
    }

    public async confirmarConfiguracaoMfa(usuarioId: string, token: string): Promise<void> {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuario || !usuario.mfa_secret) throw new Error('Configuração não iniciada');

        const isValid = authenticator.check(token, usuario.mfa_secret);

        if (!isValid) throw new Error('Código de confirmação inválido');

        await prisma.usuario.update({
            where: { id: usuarioId },
            data: { mfa_habilitado: true }
        });
    }

    public async getTermoAtual() {
        return prisma.termoUso.findFirst({
            where: { publicado: true },
            orderBy: { created_at: 'desc' }
        });
    }

    public async aceitarTermos(usuarioId: string, termoId: string, req: any): Promise<void> {
        const ip_origem = req.ip || req.socket.remoteAddress || '0.0.0.0';
        const user_agent = req.headers['user-agent'] || 'Desconhecido';

        await prisma.$transaction([
            prisma.aceiteTermo.create({
                data: {
                    usuario_id: usuarioId,
                    termo_id: termoId,
                    ip_origem,
                    user_agent
                }
            }),
            prisma.usuario.update({
                where: { id: usuarioId },
                data: {
                    aceitou_termos: true,
                    data_aceite: new Date()
                }
            })
        ]);
    }

    private async resetarTentativas(usuarioId: string) {
        await prisma.usuario.update({
            where: { id: usuarioId },
            data: {
                ultimo_acesso: new Date(),
                tentativas_login: 0,
                bloqueado_ate: null
            }
        });
    }

    private gerarToken(usuario: any, app: FastifyInstance): string {
        return app.jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                perfil: usuario.perfil.nome,
                consignataria_id: usuario.consignataria_id
            },
            { expiresIn: JWT_EXPIRES_IN }
        );
    }
}
