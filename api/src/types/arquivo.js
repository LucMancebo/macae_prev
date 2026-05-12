"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA_FOLHA_ENTRADA = void 0;
exports.SCHEMA_FOLHA_ENTRADA = {
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
