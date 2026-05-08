export type StatusServidor = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
export type SituacaoFuncional = 'ATIVO' | 'APOSENTADO' | 'PENSIONISTA';
export type TipoConsignataria = 'BANCO' | 'SEGURADORA' | 'PLANO_SAUDE' | 'ASSOCIACAO' | 'OUTROS';
export type StatusConsignataria = 'ATIVA' | 'SUSPENSA' | 'INATIVA';

export interface Servidor {
    id: string;
    cpf: string;
    nome: string;
    matricula: string;
    cargo: string;
    situacao_funcional: SituacaoFuncional;
    data_admissao: string;
    remuneracao_bruta: number;
    status: StatusServidor;
    created_at: string;
    updated_at: string;
}

export interface Consignataria {
    id: string;
    cnpj: string;
    razao_social: string;
    nome_fantasia?: string;
    tipo: TipoConsignataria;
    cet_maximo?: number;
    status: StatusConsignataria;
    contato_email?: string;
    contato_telefone?: string;
    created_at: string;
    updated_at: string;
    _count?: {
        contratos: number;
        usuarios: number;
    };
}


export interface Usuario {
    id: string;
    nome: string;
    email: string;
    perfil_id: string;
    consignataria_id?: string;
    status: 'ATIVO' | 'BLOQUEADO' | 'INATIVO';
    ultimo_acesso?: string;
    created_at: string;
    perfil: { nome: string };
    consignataria?: { razao_social: string };
}

export interface PerfilAcesso {
    id: string;
    nome: string;
    descricao?: string;
}

export interface AuditLog {
    id: string;
    usuario_id: string;
    entidade: string;
    entidade_id: string;
    acao: 'INCLUSAO' | 'ALTERACAO' | 'EXCLUSAO' | 'CONSULTA' | 'LOGIN';
    ip_origem: string;
    user_agent?: string;
    created_at: string;
    data_hora: string;
    usuario: {
        nome: string;
        email: string;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}
