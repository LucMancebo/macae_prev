import { FastifyReply, FastifyRequest } from 'fastify';
import { ArquivoService } from './arquivo.service';

export class ArquivoController {
    private readonly arquivoService: ArquivoService;

    constructor() {
        this.arquivoService = new ArquivoService();
    }

    public importarArquivo = async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;
        const nomeArquivo = body?.nome_arquivo || body?.nomeArquivo || 'FOLHA_CONSIGNACOES_MACAEPREV.csv';
        const conteudo = body?.conteudo_csv || body?.conteudoCsv || body?.arquivo_base64 || body?.arquivo;

        if (!conteudo) {
            return reply.status(400).send({ error: 'Conteúdo CSV é obrigatório' });
        }

        const user = request.user as { id: string; perfil?: string } | undefined;

        const resultado = await this.arquivoService.importarArquivo({
            nomeArquivo,
            conteudo,
            usuarioId: user!.id
        });

        return reply.status(201).send(resultado);
    };

    public buscarArquivo = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = request.user as { id: string; perfil?: string } | undefined;
        const arquivo = await this.arquivoService.buscarArquivo(id, user?.perfil === 'ADMINISTRADOR' ? undefined : user!.id);
        return reply.send(arquivo);
    };

    public exportarArquivos = async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;
        const dataInicio = query?.data_inicio ? new Date(query.data_inicio) : undefined;
        const dataFim = query?.data_fim ? new Date(query.data_fim) : undefined;

        const user = request.user as { id: string; perfil?: string } | undefined;
        const resultado = await this.arquivoService.exportarArquivos({
            dataInicio,
            dataFim,
            usuarioId: user?.perfil === 'ADMINISTRADOR' ? undefined : user!.id
        });

        reply.header('Content-Type', 'text/csv; charset=utf-8');
        reply.header('Content-Disposition', `attachment; filename="${resultado.nome_arquivo}"`);
        return reply.send(resultado.csv);
    };
}
