import crypto from 'crypto';
import { prisma } from '../../config/database';
import {
    LinhaFolhaEntrada,
    ParseResultCSV,
    ResponseExportRetorno,
    ResponseUploadArquivo,
    SCHEMA_FOLHA_ENTRADA,
    ValidacaoArquivo
} from '../../types/arquivo';
import { parseCSV } from '../../utils/csv-parser';
import {
    detectarDuplicacao,
    gerarNomeArquivo,
    validarArquivo,
    validarNomeArquivo,
    ValidacaoArquivoResult
} from '../../utils/validators-arquivo';

export interface ArquivoProcessadoResult {
    nome_arquivo: string;
    validacao: ValidacaoArquivoResult & {
        nome_valido: boolean;
        erro_nome?: string;
        duplicado: boolean;
        motivo_duplicacao?: string;
    };
    parse: ParseResultCSV;
    resumo: ResponseUploadArquivo;
}

export interface CsvRetornoOptions {
    arquivoId?: string;
    dataGeracao?: Date;
}

export interface ImportarArquivoInput {
    nomeArquivo: string;
    conteudo: Buffer | string;
    usuarioId: string;
    caminhoArquivo?: string;
    checksumsExistentes?: { md5: string; sha256: string }[];
}

export interface ArquivoImportadoResult {
    arquivo: {
        id: string;
        nome_arquivo: string;
        status: string;
        total_registros: number;
        registros_sucesso: number | null;
        registros_erro: number | null;
        data_geracao: Date;
        data_processamento: Date | null;
    };
    processamento: ArquivoProcessadoResult;
}

export interface ExportarArquivosFiltro {
    dataInicio?: Date;
    dataFim?: Date;
    usuarioId?: string;
}

export class ArquivoService {
    private normalizarBuffer(conteudo: Buffer | string): Buffer {
        return Buffer.isBuffer(conteudo) ? conteudo : Buffer.from(conteudo, 'utf-8');
    }

    async validarArquivoEntrada(
        buffer: Buffer,
        nomeArquivo: string,
        checksumsExistentes: { md5: string; sha256: string }[] = []
    ): Promise<ArquivoProcessadoResult['validacao']> {
        const validacaoArquivo = await validarArquivo(buffer, { maxTamanoMB: 10 });
        const validacaoNome = validarNomeArquivo(nomeArquivo, 'FOLHA');
        const duplicacao = await detectarDuplicacao(buffer, checksumsExistentes);

        return {
            ...validacaoArquivo,
            nome_valido: validacaoNome.valido,
            erro_nome: validacaoNome.erro,
            duplicado: duplicacao.duplicado,
            motivo_duplicacao: duplicacao.razao
        };
    }

    async processarFolhaCSV(
        buffer: Buffer,
        nomeArquivo: string,
        checksumsExistentes: { md5: string; sha256: string }[] = []
    ): Promise<ArquivoProcessadoResult> {
        const validacao = await this.validarArquivoEntrada(buffer, nomeArquivo, checksumsExistentes);

        if (!validacao.valido || !validacao.nome_valido || validacao.duplicado) {
            const parseVazio: ParseResultCSV = {
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

        const parse = await parseCSV(buffer, SCHEMA_FOLHA_ENTRADA, {
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

        const resultado: ParseResultCSV = {
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

        const resumo: ResponseUploadArquivo = {
            arquivo_id: crypto.randomUUID(),
            nome: nomeArquivo,
            status: resultado.sucesso ? 'PROCESSADO' : 'ERRO_PROCESSAMENTO',
            linhas_processadas: resultado.linhas_validas,
            erros: resultado.erros,
            resultado_reconciliacao: {
                arquivo_id: crypto.randomUUID(),
                total_parcelas: resultado.linhas.length,
                conciliadas: resultado.linhas_validas,
                pendentes: resultado.linhas_erro,
                erros: resultado.linhas_erro,
                taxa_conciliacao:
                    resultado.linhas.length > 0 ? (resultado.linhas_validas / resultado.linhas.length) * 100 : 0,
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

    async importarArquivo(input: ImportarArquivoInput): Promise<ArquivoImportadoResult> {
        const buffer = this.normalizarBuffer(input.conteudo);
        const processamento = await this.processarFolhaCSV(
            buffer,
            input.nomeArquivo,
            input.checksumsExistentes || []
        );

        const agora = new Date();
        const arquivo = await prisma.arquivoIntegracao.create({
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

        return {
            arquivo,
            processamento
        };
    }

    async buscarArquivo(id: string, usuarioId?: string) {
        const arquivo = await prisma.arquivoIntegracao.findFirst({
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

    async exportarArquivos(filtro: ExportarArquivosFiltro = {}): Promise<ResponseExportRetorno> {
        const arquivos = await prisma.arquivoIntegracao.findMany({
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
            nome_arquivo: gerarNomeArquivo('RETORNO'),
            linhas: arquivos.length,
            data_geracao: dataGeracao
        };
    }

    gerarCsvRetorno(linhas: LinhaFolhaEntrada[], options: CsvRetornoOptions = {}): ResponseExportRetorno {
        const arquivoId = options.arquivoId || crypto.randomUUID();
        const dataGeracao = options.dataGeracao || new Date();
        const nome_arquivo = gerarNomeArquivo('RETORNO');

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

    private encontrarDuplicados(linhas: LinhaFolhaEntrada[]): number[] {
        const vistos = new Set<string>();
        const duplicados: number[] = [];

        for (const linha of linhas) {
            const chave = [
                linha.consignante_id,
                linha.consignataria_id,
                linha.servidor_matricula,
                linha.parcela_numero.toString()
            ].join('|');

            if (vistos.has(chave)) {
                duplicados.push(linha.numero_linha);
            } else {
                vistos.add(chave);
            }
        }

        return duplicados;
    }

    private escaparCsv(valor: string | number | undefined): string {
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
