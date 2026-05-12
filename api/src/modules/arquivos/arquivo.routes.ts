import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ArquivoController } from './arquivo.controller';

export async function arquivosRoutes(app: FastifyInstance) {
    const controller = new ArquivoController();

    const authenticateAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();

            if (request.user?.perfil !== 'ADMINISTRADOR') {
                return reply.status(403).send({
                    error: 'Acesso restrito',
                    message: 'Somente usuários ADMINISTRADOR podem acessar o módulo de arquivos.'
                });
            }
        } catch {
            return reply.status(401).send({
                error: 'Não autorizado',
                message: 'Sessão inválida ou expirada.'
            });
        }
    };

    app.addHook('preHandler', authenticateAdmin);

    app.post('/import', controller.importarArquivo);
    app.get('/export', controller.exportarArquivos);
    app.get('/:id', controller.buscarArquivo);
}
