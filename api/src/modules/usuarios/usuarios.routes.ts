import { FastifyInstance } from 'fastify';
import { UsuariosController } from './usuarios.controller';

export async function usuariosRoutes(app: FastifyInstance) {
    const controller = new UsuariosController();

    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
            
            // Verificação de Role (RBAC): Apenas ADMINISTRADOR pode gerenciar usuários
            const user = (request as any).user;
            if (user.perfil !== 'ADMINISTRADOR') {
                return reply.status(403).send({ error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' });
            }
        } catch (err) {
            reply.status(401).send({ error: 'Não autorizado' });
        }
    });

    app.get('/', controller.listar);
    app.post('/', controller.criar);
    app.put('/:id', controller.atualizar);
    app.delete('/:id', controller.excluir);
}
