"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArquivoService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../config/database");
const arquivo_1 = require("../../types/arquivo");
const csv_parser_1 = require("../../utils/csv-parser");
const validators_arquivo_1 = require("../../utils/validators-arquivo");
const reconciliacao_1 = require("../../utils/reconciliacao");
class ArquivoService {
    normalizarBuffer(conteudo) {
        return Buffer.isBuffer(conteudo) ? conteudo : Buffer.from(conteudo, 'utf-8');
    }
    async validarArquivoEntrada(buffer, nomeArquivo, checksumsExistentes = []) {
        const validacaoArquivo = await (0, validators_arquivo_1.validarArquivo)(buffer, { maxTamanoMB: 10 });
        const validacaoNome = (0, validators_arquivo_1.validarNomeArquivo)(nomeArquivo, 'FOLHA');
        const duplicacao = await (0, validators_arquivo_1.detectarDuplicacao)(buffer, checksumsExistentes);
        return {
            ...validacaoArquivo,
            nome_valido: validacaoNome.valido,
            erro_nome: validacaoNome.erro,
            duplicado: duplicacao.duplicado,
            motivo_duplicacao: duplicacao.razao
        };
    }
    async processarFolhaCSV(buffer, nomeArquivo, checksumsExistentes = []) {
        const validacao = await this.validarArquivoEntrada(buffer, nomeArquivo, checksumsExistentes);
        if (!validacao.valido || !validacao.nome_valido || validacao.duplicado) {
            const parseVazio = {
                sucesso: false,
                linhas: [],
                linhas_validas: 0,
                linhas_erro: 0,
                erros: [
                    ...validacao.erros.map((erro) => ({ numero_linha: 0, mensagem: erro })),
                    ...(validacao.erro_nome ? [{ numero_linha: 0, mensagem: validacao.erro_nome }] : []),
                    ...(validacao.motivo_duplicacao ? [{ numero_linha: 0, mensagem: validacao.motivo_duplicacao }] : [])
                ],
                encoding: 'utf-8',
                delimiter: ',',
                tempo_processamento_ms: 0
            };
            return {
                nome_arquivo: nomeArquivo,
                validacao,
                parse: parseVazio,
                resumo: {
                    arquivo_id: '',
                    nome: nomeArquivo,
                    status: 'ERRO_PROCESSAMENTO',
                    linhas_processadas: 0,
                    erros: parseVazio.erros,
                    resultado_reconciliacao: {
                        arquivo_id: '',
                        total_parcelas: 0,
                        conciliadas: 0,
                        pendentes: 0,
                        erros: 0,
                        taxa_conciliacao: 0,
                        detalhes_por_status: {
                            CONCILIADA: 0,
                            PENDENTE: 0,
                            ERRO_FK: 0,
                            ERRO_VALOR: 0,
                            ERRO_ARQUIVO: 0
                        },
                        detalhes_por_motivo: {},
                        data_inicio_processamento: new Date(),
                        data_fim_processamento: new Date(),
                        tempo_processamento_ms: 0
                    }
                }
            };
        }
        const parse = await (0, csv_parser_1.parseCSV)(buffer, arquivo_1.SCHEMA_FOLHA_ENTRADA, {
            autoDelimiter: true,
            autoBOM: true,
            autoEncoding: true,
            validarSchema: true,
            validarTipos: true,
            maxLinhas: 100000,
            maxTamanoMB: 10
        });
        const duplicados = this.encontrarDuplicados(parse.linhas);
        const linhasValidas = parse.linhas.length - duplicados.length;
        const linhasErro = parse.linhas_erro + duplicados.length;
        const resultado = {
            ...parse,
            sucesso: parse.sucesso && duplicados.length === 0,
            linhas_validas: linhasValidas,
            linhas_erro: linhasErro,
            erros: [
                ...parse.erros,
                ...duplicados.map((numero_linha) => ({
                    numero_linha,
                    mensagem: 'Linha duplicada no arquivo'
                }))
            ]
        };
        const resumo = {
            arquivo_id: crypto_1.default.randomUUID(),
            nome: nomeArquivo,
            status: resultado.sucesso ? 'PROCESSADO' : 'ERRO_PROCESSAMENTO',
            linhas_processadas: resultado.linhas_validas,
            erros: resultado.erros,
            resultado_reconciliacao: {
                arquivo_id: crypto_1.default.randomUUID(),
                total_parcelas: resultado.linhas.length,
                conciliadas: resultado.linhas_validas,
                pendentes: resultado.linhas_erro,
                erros: resultado.linhas_erro,
                taxa_conciliacao: resultado.linhas.length > 0 ? (resultado.linhas_validas / resultado.linhas.length) * 100 : 0,
                detalhes_por_status: {
                    CONCILIADA: resultado.linhas_validas,
                    PENDENTE: resultado.linhas_erro,
                    ERRO_FK: 0,
                    ERRO_VALOR: 0,
                    ERRO_ARQUIVO: resultado.linhas_erro
                },
                detalhes_por_motivo: duplicados.length > 0 ? { 'Linha duplicada no arquivo': duplicados.length } : {},
                data_inicio_processamento: new Date(),
                data_fim_processamento: new Date(),
                tempo_processamento_ms: resultado.tempo_processamento_ms
            }
        };
        return {
            nome_arquivo: nomeArquivo,
            validacao,
            parse: resultado,
            resumo
        };
    }
    async importarArquivo(input) {
        const buffer = this.normalizarBuffer(input.conteudo);
        const processamento = await this.processarFolhaCSV(buffer, input.nomeArquivo, input.checksumsExistentes || []);
        const agora = new Date();
        const arquivo = await database_1.prisma.arquivoIntegracao.create({
            data: {
                tipo: 'ENVIO',
                competencia: agora.toISOString().slice(0, 7),
                nome_arquivo: input.nomeArquivo,
                caminho_arquivo: input.caminhoArquivo || `inline://${processamento.resumo.arquivo_id}`,
                data_geracao: agora,
                data_processamento: agora,
                total_registros: processamento.parse.linhas.length,
                registros_sucesso: processamento.parse.linhas_validas,
                registros_erro: processamento.parse.linhas_erro,
                status: processamento.parse.sucesso ? 'PROCESSADO' : 'ERRO',
                usuario_id: input.usuarioId
            }
        });
        // executar reconciliação simples (MVP) usando as linhas parseadas
        try {
            const reconciliacao = await (0, reconciliacao_1.reconciliarParcelas)(processamento.parse.linhas, arquivo.id);
            // atualiza contadores no registro do arquivo
            await database_1.prisma.arquivoIntegracao.update({
                where: { id: arquivo.id },
                data: {
                    registros_sucesso: reconciliacao.conciliadas,
                    registros_erro: reconciliacao.erros,
                    status: reconciliacao.conciliadas > 0 ? 'PROCESSADO' : arquivo.status
                }
            });
            // anexa o resumo da reconciliação ao processamento retornado
            processamento.resumo.resultado_reconciliacao = {
                ...processamento.resumo.resultado_reconciliacao,
                ...reconciliacao
            };
        }
        catch (err) {
            // não falhar a importação principal por erro de reconciliação; apenas logar
            // eslint-disable-next-line no-console
            console.error('Erro na reconciliação MVP:', err);
        }
        return {
            arquivo,
            processamento
        };
    }
    async buscarArquivo(id, usuarioId) {
        const arquivo = await database_1.prisma.arquivoIntegracao.findFirst({
            where: {
                id,
                ...(usuarioId ? { usuario_id: usuarioId } : {})
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        perfil: true
                    }
                },
                parcelas: true
            }
        });
        if (!arquivo) {
            throw new Error('Arquivo não encontrado');
        }
        return arquivo;
    }
    async exportarArquivos(filtro = {}) {
        const arquivos = await database_1.prisma.arquivoIntegracao.findMany({
            where: {
                ...(filtro.usuarioId ? { usuario_id: filtro.usuarioId } : {}),
                ...(filtro.dataInicio || filtro.dataFim
                    ? {
                        data_geracao: {
                            ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
                            ...(filtro.dataFim ? { lte: filtro.dataFim } : {})
                        }
                    }
                    : {})
            },
            orderBy: { data_geracao: 'desc' }
        });
        const dataGeracao = new Date();
        const header = ['arquivo_id', 'nome_arquivo', 'status', 'total_registros', 'registros_sucesso', 'registros_erro', 'data_processamento'];
        const csv = [
            header,
            ...arquivos.map((arquivo) => [
                arquivo.id,
                arquivo.nome_arquivo,
                arquivo.status,
                arquivo.total_registros.toString(),
                String(arquivo.registros_sucesso ?? 0),
                String(arquivo.registros_erro ?? 0),
                arquivo.data_processamento?.toISOString() || ''
            ])
        ]
            .map((campos) => campos.map((valor) => this.escaparCsv(valor)).join(','))
            .join('\r\n');
        return {
            csv,
            nome_arquivo: (0, validators_arquivo_1.gerarNomeArquivo)('RETORNO'),
            linhas: arquivos.length,
            data_geracao: dataGeracao
        };
    }
    gerarCsvRetorno(linhas, options = {}) {
        const arquivoId = options.arquivoId || crypto_1.default.randomUUID();
        const dataGeracao = options.dataGeracao || new Date();
        const nome_arquivo = (0, validators_arquivo_1.gerarNomeArquivo)('RETORNO');
        const header = [
            'arquivo_id',
            'consignante_id',
            'consignataria_id',
            'servidor_matricula',
            'parcela_id',
            'status_processamento',
            'valor_conciliado',
            'motivo_nao_processamento',
            'data_processamento'
        ];
        const csvLinhas = linhas.map((linha) => [
            arquivoId,
            linha.consignante_id,
            linha.consignataria_id,
            linha.servidor_matricula,
            linha.arquivo_id || '',
            linha.status === 'VALIDA' ? 'CONCILIADA' : 'ERRO_ARQUIVO',
            linha.valor_parcela.toFixed(2),
            linha.erros?.join('; ') || '',
            dataGeracao.toISOString()
        ]);
        const csv = [header, ...csvLinhas].map((campos) => campos.map((valor) => this.escaparCsv(valor)).join(',')).join('\r\n');
        return {
            csv,
            nome_arquivo,
            linhas: linhas.length,
            data_geracao: dataGeracao
        };
    }
    encontrarDuplicados(linhas) {
        const vistos = new Set();
        const duplicados = [];
        for (const linha of linhas) {
            const chave = [
                linha.consignante_id,
                linha.consignataria_id,
                linha.servidor_matricula,
                linha.parcela_numero.toString()
            ].join('|');
            if (vistos.has(chave)) {
                duplicados.push(linha.numero_linha);
            }
            else {
                vistos.add(chave);
            }
        }
        return duplicados;
    }
    escaparCsv(valor) {
        if (valor === undefined || valor === null) {
            return '';
        }
        const texto = String(valor);
        if (texto.includes(',') || texto.includes('"') || texto.includes('\n') || texto.includes('\r')) {
            return `"${texto.replace(/"/g, '""')}"`;
        }
        return texto;
    }
}
exports.ArquivoService = ArquivoService;
