export interface Arquivo {
    id: string;
    nome: string;
    tipo: 'FOLHA' | 'RETORNO' | 'LEGADO';
    data_upload: Date;
    data_processamento?: Date;
    usuario_id: string;
    consignante_id?: string;
    checksum_md5?: string;
    checksum_sha256?: string;
    tamanho_bytes: number;
    status: 'PENDENTE_PROCESSAMENTO' | 'PROCESSANDO' | 'PROCESSADO' | 'ERRO_PROCESSAMENTO' | 'CANCELADO';
    linhas_total: number;
    linhas_processadas: number;
    linhas_erro: number;
    encoding_detectado: 'utf-8' | 'utf-8-bom' | 'iso-8859-1' | 'cp-1252';
    delimiter_detectado: ',' | '\t' | '|';
    created_at: Date;
    updated_at: Date;
}

export interface LinhaFolhaEntrada {
    arquivo_id: string;
    numero_linha: number;
    consignante_id: string;
    consignataria_id: string;
    servidor_matricula: string;
    servidor_nome: string;
    produto_id: string;
    valor_liquido: number;
    desconto_consignante?: number;
    taxa_efetiva: number;
    cet: number;
    parcela_numero: number;
    valor_parcela: number;
    data_vencimento: Date;
    desconto_retencao?: number;
    acrescimo_juros?: number;
    observacoes?: string;
    status: 'VALIDA' | 'ERRO_VALIDACAO';
    erros?: string[];
}

export interface LinhaFolhaRetorno {
    arquivo_id: string;
    consignante_id: string;
    consignataria_id: string;
    servidor_matricula: string;
    parcela_id: string;
    status_processamento: 'CONCILIADA' | 'PENDENTE' | 'ERRO_FK' | 'ERRO_VALOR' | 'ERRO_ARQUIVO';
    valor_conciliado: number;
    motivo_nao_processamento?: string;
    data_processamento: Date;
}

export interface Repasse {
    id: string;
    parcela_id: string;
    arquivo_id: string;
    tipo: 'DESCONTO' | 'ACRESCIMO' | 'JUROS' | 'RETENCAO';
    valor: number;
    percentual?: number;
    data_movimento: Date;
    created_at: Date;
}

export interface ErroProcessamento {
    codigo: string;
    mensagem: string;
    numero_linha?: number;
    campo?: string;
    valor_recebido?: string;
    detalhes?: Record<string, unknown>;
}

export interface ParseResultCSV {
    sucesso: boolean;
    linhas: LinhaFolhaEntrada[];
    linhas_validas: number;
    linhas_erro: number;
    erros: Array<{
        numero_linha: number;
        mensagem: string;
    }>;
    encoding: 'utf-8' | 'utf-8-bom' | 'iso-8859-1' | 'cp-1252';
    delimiter: ',' | '\t' | '|';
    tempo_processamento_ms: number;
}

export interface ValidacaoArquivo {
    valido: boolean;
    erros: string[];
    tamanho_bytes: number;
    encoding: string;
    checksum_md5?: string;
    checksum_sha256?: string;
}

export interface ResultadoReconciliacao {
    arquivo_id: string;
    total_parcelas: number;
    conciliadas: number;
    pendentes: number;
    erros: number;
    taxa_conciliacao: number;
    detalhes_por_status: {
        CONCILIADA: number;
        PENDENTE: number;
        ERRO_FK: number;
        ERRO_VALOR: number;
        ERRO_ARQUIVO: number;
    };
    detalhes_por_motivo: {
        [motivo: string]: number;
    };
    data_inicio_processamento: Date;
    data_fim_processamento: Date;
    tempo_processamento_ms: number;
}

export interface ResponseUploadArquivo {
    arquivo_id: string;
    nome: string;
    status: string;
    linhas_processadas: number;
    erros: Array<{
        numero_linha: number;
        mensagem: string;
    }>;
    resultado_reconciliacao: ResultadoReconciliacao;
}

export interface ResponseExportRetorno {
    csv: string;
    nome_arquivo: string;
    linhas: number;
    data_geracao: Date;
}

export interface OpcoesParserCSV {
    autoDelimiter?: boolean;
    autoBOM?: boolean;
    autoEncoding?: boolean;
    validarSchema?: boolean;
    validarTipos?: boolean;
    maxLinhas?: number;
    maxTamanoMB?: number;
}

export const SCHEMA_FOLHA_ENTRADA = {
    colunas_ordenadas: [
        'consignante_id',
        'consignataria_id',
        'servidor_matricula',
        'servidor_nome',
        'produto_id',
        'valor_liquido',
        'desconto_consignante',
        'taxa_efetiva',
        'cet',
        'parcela_numero',
        'valor_parcela',
        'data_vencimento',
        'desconto_retencao',
        'acrescimo_juros',
        'observacoes'
    ],
    colunas_obrigatorias: [
        'consignante_id',
        'consignataria_id',
        'servidor_matricula',
        'servidor_nome',
        'produto_id',
        'valor_liquido',
        'taxa_efetiva',
        'cet',
        'parcela_numero',
        'valor_parcela',
        'data_vencimento'
    ],
    colunas_opcionais: ['desconto_consignante', 'desconto_retencao', 'acrescimo_juros', 'observacoes'],
    tipos: {
        consignante_id: 'string',
        consignataria_id: 'string',
        servidor_matricula: 'string',
        servidor_nome: 'string',
        produto_id: 'string',
        valor_liquido: 'decimal',
        desconto_consignante: 'decimal',
        taxa_efetiva: 'decimal',
        cet: 'decimal',
        parcela_numero: 'integer',
        valor_parcela: 'decimal',
        data_vencimento: 'date',
        desconto_retencao: 'decimal',
        acrescimo_juros: 'decimal',
        observacoes: 'string'
    },
    tamanhos: {
        consignante_id: 20,
        consignataria_id: 20,
        servidor_matricula: 20,
        servidor_nome: 200,
        produto_id: 20,
        observacoes: 500
    }
};
