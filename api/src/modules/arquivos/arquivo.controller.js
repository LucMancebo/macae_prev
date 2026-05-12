"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArquivoController = void 0;
const arquivo_service_1 = require("./arquivo.service");
class ArquivoController {
    arquivoService;
    constructor() {
        this.arquivoService = new arquivo_service_1.ArquivoService();
    }
    importarArquivo = async (request, reply) => {
        const body = request.body;
        const nomeArquivo = body?.nome_arquivo || body?.nomeArquivo || 'FOLHA_CONSIGNACOES_MACAEPREV.csv';
        const conteudo = body?.conteudo_csv || body?.conteudoCsv || body?.arquivo_base64 || body?.arquivo;
        if (!conteudo) {
            return reply.status(400).send({ error: 'Conteúdo CSV é obrigatório' });
        }
        const resultado = await this.arquivoService.importarArquivo({
            nomeArquivo,
            conteudo,
            usuarioId: request.user.id
        });
        return reply.status(201).send(resultado);
    };
    buscarArquivo = async (request, reply) => {
        const { id } = request.params;
        const arquivo = await this.arquivoService.buscarArquivo(id, request.user?.perfil === 'ADMINISTRADOR' ? undefined : request.user.id);
        return reply.send(arquivo);
    };
    exportarArquivos = async (request, reply) => {
        const query = request.query;
        const dataInicio = query?.data_inicio ? new Date(query.data_inicio) : undefined;
        const dataFim = query?.data_fim ? new Date(query.data_fim) : undefined;
        const resultado = await this.arquivoService.exportarArquivos({
            dataInicio,
            dataFim,
            usuarioId: request.user?.perfil === 'ADMINISTRADOR' ? undefined : request.user.id
        });
        reply.header('Content-Type', 'text/csv; charset=utf-8');
        reply.header('Content-Disposition', `attachment; filename="${resultado.nome_arquivo}"`);
        return reply.send(resultado.csv);
    };
}
exports.ArquivoController = ArquivoController;
