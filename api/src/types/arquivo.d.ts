/**
 * Tipos TypeScript para Integração de Arquivos (M4)
 * Arquivo de Arquivos, Parcelas, Repassos e Reconciliação
 */

// ============================================================================
// ARQUIVO - Metadados de Upload
// ============================================================================

export interface Arquivo {
    id: string; // UUID
    nome: string; // FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv
    tipo: 'FOLHA' | 'RETORNO' | 'LEGADO';
    data_upload: Date;
    data_processamento?: Date;
    usuario_id: string; // FK User
    consignante_id?: string; // Ex: "MACAEPREV"
    checksum_md5?: string;
    checksum_sha256?: string;
    tamanho_bytes: number;
    status: 'PENDENTE_PROCESSAMENTO' | 'PROCESSANDO' | 'PROCESSADO' | 'ERRO_PROCESSAMENTO' | 'CANCELADO';
    linhas_total: number; // Linhas de dados (excluindo header)
    linhas_processadas: number;
    linhas_erro: number;
    encoding_detectado: 'utf-8' | 'utf-8-bom' | 'iso-8859-1' | 'cp-1252';
    delimiter_detectado: ',' | '\t' | '|';
    created_at: Date;
    updated_at: Date;
}

// ============================================================================
// LINHA DE ARQUIVO - Entrada (Folha MACAEPREV)
// ============================================================================

export interface LinhaFolhaEntrada {
    arquivo_id: string; // FK Arquivo
    numero_linha: number; // Número sequencial (2 para primeira linha de dados)
    consignante_id: string; // Ex: "MACAEPREV"
    consignataria_id: string; // Ex: "B001"
    servidor_matricula: string; // Ex: "MAT001"
    servidor_nome: string; // Ex: "João Silva"
    produto_id: string; // Ex: "PROD001"
    valor_liquido: number; // Ex: 5000.00
    desconto_consignante?: number; // Ex: 250.00
    taxa_efetiva: number; // Ex: 5.1234 (percentual)
    cet: number; // Custo Efetivo Total
    parcela_numero: number; // Ex: 1, 2, 3...
    valor_parcela: number; // Ex: 450.00
    data_vencimento: Date; // ISO 8601
    desconto_retencao?: number; // Imposto retido
    acrescimo_juros?: number; // Juros ou correção
    observacoes?: string; // Texto livre
    status: 'VALIDA' | 'ERRO_VALIDACAO';
    erros?: string[]; // Array de mensagens de erro
}

// ============================================================================
// LINHA DE ARQUIVO - Saída (Retorno Processado)
// ============================================================================

export interface LinhaFolhaRetorno {
    arquivo_id: string; // FK Arquivo
    consignante_id: string; // "MACAEPREV"
    consignataria_id: string; // Ex: "B001"
    servidor_matricula: string; // Ex: "MAT001"
    parcela_id: string; // FK Parcela (UUID interno)
    status_processamento: 'CONCILIADA' | 'PENDENTE' | 'ERRO_FK' | 'ERRO_VALOR' | 'ERRO_ARQUIVO';
    valor_conciliado: number; // Valor efetivamente processado
    motivo_nao_processamento?: string; // Ex: "Servidor sem margem disponível"
    data_processamento: Date; // ISO 8601
}

// ============================================================================
// REPASSE - Movimentação de Parcela (Desconto, Acréscimo, Juros)
// ============================================================================

export interface Repasse {
    id: string; // UUID
    parcela_id: string; // FK Parcela
    arquivo_id: string; // FK Arquivo
    tipo: 'DESCONTO' | 'ACRESCIMO' | 'JUROS' | 'RETENCAO';
    valor: number; // Valor absoluto
    percentual?: number; // Percentual aplicado (se aplicável)
    data_movimento: Date;
    created_at: Date;
}

// ============================================================================
// RESULTADO DE PARSING - Retorno do CSV Parser
// ============================================================================

export interface ParseResultCSV {
    sucesso: boolean;
    linhas: LinhaFolhaEntrada[]; // Linhas parseadas
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

// ============================================================================
// RESULTADO DE VALIDAÇÃO - Validação de Arquivo
// ============================================================================

export interface ValidacaoArquivo {
    valido: boolean;
    erros: string[];
    tamanho_bytes: number;
    encoding: string;
    checksum_md5?: string;
    checksum_sha256?: string;
}

// ============================================================================
// RESULTADO DE RECONCILIAÇÃO - Status de Conciliação
// ============================================================================

export interface ResultadoReconciliacao {
    arquivo_id: string;
    total_parcelas: number;
    conciliadas: number;
    pendentes: number;
    erros: number;
    taxa_conciliacao: number; // Percentual (0-100)
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

// ============================================================================
// RELATÓRIO DE RECONCILIAÇÃO - Filtros e Grouping
// ============================================================================

export interface FiltroReconciliacao {
    arquivo_id?: string;
    consignante_id?: string;
    consignataria_id?: string;
    data_inicio?: Date;
    data_fim?: Date;
    status_processamento?: 'CONCILIADA' | 'PENDENTE' | 'ERRO_FK' | 'ERRO_VALOR' | 'ERRO_ARQUIVO';
}

export interface RelatorioReconciliacao {
    periodo: {
        data_inicio: Date;
        data_fim: Date;
    };
    resumo: {
        total_parcelas: number;
        conciliadas: number;
        pendentes: number;
        taxa_conciliacao: number;
    };
    por_consignataria: Array<{
        consignataria_id: string;
        total: number;
        conciliadas: number;
        pendentes: number;
        taxa: number;
    }>;
    por_status: {
        [key: string]: number;
    };
    arquivos_processados: number;
    data_geracao: Date;
}

// ============================================================================
// ERRO DE PROCESSAMENTO
// ============================================================================

export interface ErroProcessamento {
    codigo: string; // Ex: "HEADER_INVALIDO", "FK_INVALIDA", "VALOR_NEGATIVO"
    mensagem: string;
    numero_linha?: number;
    campo?: string;
    valor_recebido?: string;
    detalhes?: Record<string, unknown>;
}

// ============================================================================
// CONTEXTO DE PROCESSAMENTO - Estado durante execução
// ============================================================================

export interface ContextoProcessamento {
    arquivo_id: string;
    usuario_id: string;
    timestamp_inicio: Date;
    linhas_processadas: number;
    linhas_com_erro: number;
    erros: ErroProcessamento[];
    transacao_ativa: boolean;
}

// ============================================================================
// REQUEST/RESPONSE API
// ============================================================================

export interface RequestUploadArquivo {
    arquivo: Buffer; // Conteúdo do arquivo
    nome: string; // Nome do arquivo
    checksum_md5?: string; // Opcional, para validação
    checksum_sha256?: string; // Opcional, para validação
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
    csv: string; // Conteúdo do CSV de retorno
    nome_arquivo: string; // FOLHA_RETORNO_MACAEPREV_...
    linhas: number;
    data_geracao: Date;
}

// ============================================================================
// OPÇÕES DE PARSER
// ============================================================================

export interface OpcoesParserCSV {
    autoDelimiter?: boolean; // Auto-detectar delimiter
    autoBOM?: boolean; // Auto-remover BOM
    autoEncoding?: boolean; // Auto-detectar encoding
    validarSchema?: boolean; // Validar colunas obrigatórias
    validarTipos?: boolean; // Validar tipos de dados
    maxLinhas?: number; // Default: 100.000
    maxTamanoMB?: number; // Default: 10
}

// ============================================================================
// TIPO DE ARQUIVO LEGADO
// ============================================================================

export interface ConsignacaoLegado {
    id_externo: string;
    cpf_servidor: string;
    nome_servidor: string;
    matricula_servidor: string;
    cnpj_consignataria: string;
    razao_social_consignataria: string;
    produto_nome: string;
    valor_total: number;
    valor_parcela: number;
    quantidade_parcelas: number;
    parcelas_pagas: number;
    taxa_juros: number;
    data_inicio: Date;
    data_fim?: Date;
    status: 'ATIVO' | 'INATIVO' | 'LIQUIDADO' | 'CANCELADO' | 'NOVO';
    data_criacao: Date;
    data_ultima_atualizacao: Date;
}

// ============================================================================
// SCHEMA DE VALIDAÇÃO
// ============================================================================

export const SCHEMA_FOLHA_ENTRADA = {
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
    colunas_opcionais: [
        'desconto_consignante',
        'desconto_retencao',
        'acrescimo_juros',
        'observacoes'
    ],
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
