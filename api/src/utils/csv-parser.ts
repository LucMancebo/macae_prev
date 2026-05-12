/**
 * CSV Parser para Arquivos de Folha de Pagamento MACAEPREV
 * Responsável por parsear, validar e transformar CSV em objetos tipados
 *
 * Suporta:
 * - Detecção automática de encoding (UTF-8, BOM, ISO-8859-1, CP-1252)
 * - Detecção automática de delimiter (comma, tab, pipe)
 * - Remoção automática de BOM
 * - Validação de schema (colunas obrigatórias)
 * - Validação de tipos de dados
 * - Tratamento de erros por linha
 */

import { Buffer } from 'buffer';
import {
    LinhaFolhaEntrada,
    ParseResultCSV,
    SCHEMA_FOLHA_ENTRADA,
    OpcoesParserCSV,
    ErroProcessamento
} from '../types/arquivo';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENCODINGS = ['utf-8', 'utf-8-bom', 'iso-8859-1', 'cp-1252'] as const;
const DELIMITERS = [',', '\t', '|'] as const;
const BOM_UTF8 = Buffer.from([0xef, 0xbb, 0xbf]);

const STATUS_PARCELAS_ENUM = ['SOLICITADA', 'APROVADA', 'ATIVA', 'QUITADA', 'CANCELADA', 'PORTADA'] as const;

// ============================================================================
// DETECÇÃO DE ENCODING
// ============================================================================

export function detectarEncoding(buffer: Buffer): 'utf-8' | 'utf-8-bom' | 'iso-8859-1' | 'cp-1252' {
    // Detectar BOM UTF-8
    if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        return 'utf-8-bom';
    }

    // Tentar UTF-8
    try {
        const text = buffer.toString('utf-8');
        // Verificar se contém caracteres válidos UTF-8
        if (/[\u0080-\uffff]/.test(text)) {
            return 'utf-8';
        }
    } catch {
        // Falha, continuar
    }

    // Heurística: procurar por padrões de ISO-8859-1 (Latin1) com acentos
    const text = buffer.toString('latin1');
    if (/[À-ÿ]/.test(text)) {
        return 'iso-8859-1';
    }

    // Default: CP-1252 (Windows Latin1)
    return 'cp-1252';
}

// ============================================================================
// REMOÇÃO DE BOM
// ============================================================================

export function removerBOM(buffer: Buffer): Buffer {
    if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        return buffer.slice(3);
    }
    return buffer;
}

// ============================================================================
// DETECÇÃO DE DELIMITER
// ============================================================================

export function detectarDelimiter(texto: string): ',' | '\t' | '|' {
    // Analisar primeira linha
    const primeiraLinha = texto.split('\n')[0];

    let contVirgula = 0;
    let contTab = 0;
    let contPipe = 0;

    for (const char of primeiraLinha) {
        if (char === ',') contVirgula++;
        if (char === '\t') contTab++;
        if (char === '|') contPipe++;
    }

    if (contTab > contVirgula && contTab > contPipe) {
        return '\t';
    }
    if (contPipe > contVirgula && contPipe > contTab) {
        return '|';
    }
    return ',';
}

// ============================================================================
// PARSER DE LINHA CSV
// ============================================================================

/**
 * Parse uma linha CSV considerando quotes e escaping
 * Suporta quoted fields e CRLF
 */
export function parseLinhaCSV(linha: string, delimiter: string): string[] {
    const campos: string[] = [];
    let campo = '';
    let emQuote = false;
    let i = 0;

    while (i < linha.length) {
        const char = linha[i];
        const proxChar = i + 1 < linha.length ? linha[i + 1] : '';

        if (char === '"') {
            if (emQuote && proxChar === '"') {
                // Escape quote ""
                campo += '"';
                i += 2;
                continue;
            } else {
                // Toggle quote
                emQuote = !emQuote;
                i++;
                continue;
            }
        }

        if (char === delimiter && !emQuote) {
            // Fim do campo
            campos.push(campo.trim());
            campo = '';
            i++;
            continue;
        }

        campo += char;
        i++;
    }

    // Último campo
    campos.push(campo.trim());

    return campos;
}

// ============================================================================
// VALIDAÇÃO DE TIPOS
// ============================================================================

export function validarDecimal(valor: string, casasDecimais: number = 2): { valido: boolean; valor?: number } {
    const regex = new RegExp(`^-?\\d+(\\.\\d{1,${casasDecimais}})?$`);

    if (!regex.test(valor)) {
        return { valido: false };
    }

    const num = parseFloat(valor);
    if (isNaN(num)) {
        return { valido: false };
    }

    return { valido: true, valor: num };
}

export function validarInteiro(valor: string): { valido: boolean; valor?: number } {
    const num = parseInt(valor, 10);

    if (isNaN(num)) {
        return { valido: false };
    }

    return { valido: true, valor: num };
}

export function validarData(valor: string): { valido: boolean; valor?: Date } {
    // Aceitar ISO 8601: YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(valor)) {
        return { valido: false };
    }

    const data = new Date(valor);

    if (isNaN(data.getTime())) {
        return { valido: false };
    }

    // Validar que não é data passada
    if (data < new Date()) {
        return { valido: false }; // Data passada
    }

    return { valido: true, valor: data };
}

export function validarString(valor: string, tamanhoMax?: number): { valido: boolean } {
    if (typeof valor !== 'string') {
        return { valido: false };
    }

    if (tamanhoMax && valor.length > tamanhoMax) {
        return { valido: false };
    }

    return { valido: true };
}

// ============================================================================
// VALIDAÇÃO DE LINHA
// ============================================================================

export function validarLinhaFolha(
    campos: string[],
    numeroLinha: number,
    schema: typeof SCHEMA_FOLHA_ENTRADA
): { valida: boolean; linha?: LinhaFolhaEntrada; erros: ErroProcessamento[] } {
    const erros: ErroProcessamento[] = [];

    // Validar número de campos
    const colunasEsperadas = schema.colunas_obrigatorias.length + schema.colunas_opcionais.length;

    if (campos.length < schema.colunas_obrigatorias.length) {
        erros.push({
            codigo: 'CAMPOS_INSUFICIENTES',
            mensagem: `Esperado ${schema.colunas_obrigatorias.length} campos, encontrado ${campos.length}`,
            numero_linha: numeroLinha
        });
        return { valida: false, erros };
    }

    // Mapear campos para objeto
    const mapa = schema.colunas_obrigatorias.reduce(
        (acc, col, idx) => {
            acc[col] = campos[idx] || '';
            return acc;
        },
        {} as Record<string, string>
    );

    // Adicionar opcionais
    schema.colunas_opcionais.forEach((col, idx) => {
        mapa[col] = campos[schema.colunas_obrigatorias.length + idx] || '';
    });

    // Validar campos obrigatórios
    for (const coluna of schema.colunas_obrigatorias) {
        if (!mapa[coluna] || mapa[coluna].trim() === '') {
            erros.push({
                codigo: 'CAMPO_OBRIGATORIO_VAZIO',
                mensagem: `Campo obrigatório "${coluna}" vazio`,
                numero_linha: numeroLinha,
                campo: coluna
            });
        }
    }

    // Se há erros de campos obrigatórios, retornar agora
    if (erros.length > 0) {
        return { valida: false, erros };
    }

    // Validar tipos de dados
    const validacoes: { campo: string; validar: () => any }[] = [
        {
            campo: 'valor_liquido',
            validar: () => {
                const resultado = validarDecimal(mapa.valor_liquido, 2);
                if (!resultado.valido) {
                    throw new Error(`Campo "valor_liquido" deve ser decimal válido`);
                }
                if (resultado.valor! <= 0) {
                    throw new Error(`Campo "valor_liquido" deve ser > 0`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'taxa_efetiva',
            validar: () => {
                const resultado = validarDecimal(mapa.taxa_efetiva, 4);
                if (!resultado.valido) {
                    throw new Error(`Campo "taxa_efetiva" deve ser decimal válido`);
                }
                if (resultado.valor! <= 0) {
                    throw new Error(`Campo "taxa_efetiva" deve ser > 0`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'cet',
            validar: () => {
                const resultado = validarDecimal(mapa.cet, 4);
                if (!resultado.valido) {
                    throw new Error(`Campo "cet" deve ser decimal válido`);
                }
                if (resultado.valor! <= 0) {
                    throw new Error(`Campo "cet" deve ser > 0`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'parcela_numero',
            validar: () => {
                const resultado = validarInteiro(mapa.parcela_numero);
                if (!resultado.valido) {
                    throw new Error(`Campo "parcela_numero" deve ser inteiro válido`);
                }
                if (resultado.valor! < 1 || resultado.valor! > 999) {
                    throw new Error(`Campo "parcela_numero" deve estar entre 1 e 999`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'valor_parcela',
            validar: () => {
                const resultado = validarDecimal(mapa.valor_parcela, 2);
                if (!resultado.valido) {
                    throw new Error(`Campo "valor_parcela" deve ser decimal válido`);
                }
                if (resultado.valor! <= 0) {
                    throw new Error(`Campo "valor_parcela" deve ser > 0`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'data_vencimento',
            validar: () => {
                const resultado = validarData(mapa.data_vencimento);
                if (!resultado.valido) {
                    throw new Error(`Campo "data_vencimento" deve estar em formato ISO 8601 (YYYY-MM-DD) e ser futuro`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'desconto_consignante',
            validar: () => {
                if (!mapa.desconto_consignante || mapa.desconto_consignante === '') {
                    return 0;
                }
                const resultado = validarDecimal(mapa.desconto_consignante, 2);
                if (!resultado.valido) {
                    throw new Error(`Campo "desconto_consignante" deve ser decimal válido`);
                }
                if (resultado.valor! < 0) {
                    throw new Error(`Campo "desconto_consignante" deve ser >= 0`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'desconto_retencao',
            validar: () => {
                if (!mapa.desconto_retencao || mapa.desconto_retencao === '') {
                    return 0;
                }
                const resultado = validarDecimal(mapa.desconto_retencao, 2);
                if (!resultado.valido) {
                    throw new Error(`Campo "desconto_retencao" deve ser decimal válido`);
                }
                if (resultado.valor! < 0) {
                    throw new Error(`Campo "desconto_retencao" deve ser >= 0`);
                }
                return resultado.valor;
            }
        },
        {
            campo: 'acrescimo_juros',
            validar: () => {
                if (!mapa.acrescimo_juros || mapa.acrescimo_juros === '') {
                    return 0;
                }
                const resultado = validarDecimal(mapa.acrescimo_juros, 2);
                if (!resultado.valido) {
                    throw new Error(`Campo "acrescimo_juros" deve ser decimal válido`);
                }
                if (resultado.valor! < 0) {
                    throw new Error(`Campo "acrescimo_juros" deve ser >= 0`);
                }
                return resultado.valor;
            }
        }
    ];

    const valores: Record<string, any> = {};

    for (const { campo, validar } of validacoes) {
        try {
            valores[campo] = validar();
        } catch (error) {
            erros.push({
                codigo: 'TIPO_INVALIDO',
                mensagem: (error as Error).message,
                numero_linha: numeroLinha,
                campo,
                valor_recebido: mapa[campo]
            });
        }
    }

    if (erros.length > 0) {
        return { valida: false, erros };
    }

    // Construir objeto tipado
    const linha: LinhaFolhaEntrada = {
        arquivo_id: '', // Será preenchido depois
        numero_linha: numeroLinha,
        consignante_id: mapa.consignante_id,
        consignataria_id: mapa.consignataria_id,
        servidor_matricula: mapa.servidor_matricula,
        servidor_nome: mapa.servidor_nome,
        produto_id: mapa.produto_id,
        valor_liquido: valores.valor_liquido,
        desconto_consignante: valores.desconto_consignante,
        taxa_efetiva: valores.taxa_efetiva,
        cet: valores.cet,
        parcela_numero: valores.parcela_numero,
        valor_parcela: valores.valor_parcela,
        data_vencimento: valores.data_vencimento,
        desconto_retencao: valores.desconto_retencao,
        acrescimo_juros: valores.acrescimo_juros,
        observacoes: mapa.observacoes || undefined,
        status: 'VALIDA',
        erros: undefined
    };

    return { valida: true, linha, erros: [] };
}

// ============================================================================
// PARSER PRINCIPAL
// ============================================================================

export async function parseCSV(
    buffer: Buffer,
    schema: typeof SCHEMA_FOLHA_ENTRADA = SCHEMA_FOLHA_ENTRADA,
    opcoes: OpcoesParserCSV = {}
): Promise<ParseResultCSV> {
    const timestampInicio = Date.now();
    const resultado: ParseResultCSV = {
        sucesso: true,
        linhas: [],
        linhas_validas: 0,
        linhas_erro: 0,
        erros: [],
        encoding: 'utf-8',
        delimiter: ',',
        tempo_processamento_ms: 0
    };

    try {
        // Step 1: Detectar e remover BOM
        const encoding = detectarEncoding(buffer);
        resultado.encoding = encoding;

        let bufferLimpo = buffer;
        if (encoding === 'utf-8-bom') {
            bufferLimpo = removerBOM(buffer);
        }

        // Step 2: Converter para string
        const encodingNode: BufferEncoding = encoding === 'utf-8' || encoding === 'utf-8-bom' ? 'utf8' : 'latin1';

        const texto = bufferLimpo.toString(encodingNode);

        // Step 3: Detectar delimiter
        const delimiter = opcoes.autoDelimiter !== false ? detectarDelimiter(texto) : ',';
        resultado.delimiter = delimiter;

        // Step 4: Split de linhas (considerar CRLF e LF)
        const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== '');

        if (linhas.length < 2) {
            throw new Error('Arquivo deve ter header + mínimo 1 linha de dados');
        }

        // Step 5: Validar header
        const linhaHeader = linhas[0];
        const headerCampos = parseLinhaCSV(linhaHeader, delimiter);

        if (opcoes.validarSchema !== false) {
            const colunasFaltando = schema.colunas_obrigatorias.filter(col => !headerCampos.includes(col));

            if (colunasFaltando.length > 0) {
                throw new Error(`Colunas obrigatórias faltando: ${colunasFaltando.join(', ')}`);
            }
        }

        // Step 6: Processar linhas de dados
        const maxLinhas = opcoes.maxLinhas || 100000;

        for (let i = 1; i < linhas.length && i - 1 < maxLinhas; i++) {
            const linhaRaw = linhas[i];

            if (!linhaRaw.trim()) {
                continue; // Skip linhas vazias
            }

            const campos = parseLinhaCSV(linhaRaw, delimiter);

            const validacao = validarLinhaFolha(campos, i + 1, schema);

            if (!validacao.valida) {
                resultado.linhas_erro++;
                resultado.erros.push(...validacao.erros.map(e => ({ numero_linha: i + 1, mensagem: e.mensagem })));
            } else {
                resultado.linhas_validas++;
                resultado.linhas.push(validacao.linha!);
            }
        }

        resultado.sucesso = resultado.linhas_erro === 0;
    } catch (error) {
        resultado.sucesso = false;
        resultado.erros.push({
            numero_linha: 0,
            mensagem: (error as Error).message
        });
    }

    resultado.tempo_processamento_ms = Date.now() - timestampInicio;
    return resultado;
}

// ============================================================================
// EXPORT
// ============================================================================

export default parseCSV;
