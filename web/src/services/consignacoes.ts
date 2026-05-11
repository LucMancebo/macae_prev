import { apiFetch } from './api';

export interface Consignacao {
    id: string;
    servidor_id: string;
    consignataria_id: string;
    produto_id: string;
    valor_total: number;
    taxa_juros: number;
    cet_percentual: number;
    quantidade_parcelas: number;
    valor_parcela: number;
    status_fluxo: 'SOLICITADA' | 'APROVADA' | 'ATIVA' | 'QUITADA' | 'CANCELADA' | 'PORTADA';
    data_criacao: string;
    data_aprovacao?: string;
    data_ativacao?: string;
    data_quitacao?: string;
    data_cancelamento?: string;
    servidor?: { id: string; nome: string; cpf: string; matricula: string };
    consignataria?: { id: string; razao_social: string; cnpj: string };
    produto?: { id: string; nome: string; tipo: string };
}

export interface Parcela {
    id: string;
    consignacao_id: string;
    numero_parcela: number;
    valor: number;
    competencia: string;
    status: 'PREVISTA' | 'PAGA' | 'CANCELADA';
    data_pagamento?: string;
}

export interface PaginatedConsignacoes {
    data: Consignacao[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export async function listarConsignacoes(
    page: number = 1,
    limit: number = 10,
    filters?: {
        status?: string;
        servidor_id?: string;
        consignataria_id?: string;
    }
): Promise<PaginatedConsignacoes> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.servidor_id) params.append('servidor_id', filters.servidor_id);
    if (filters?.consignataria_id) params.append('consignataria_id', filters.consignataria_id);

    return apiFetch(`/v1/consignacoes?${params.toString()}`);
}

export async function buscarConsignacao(id: string): Promise<Consignacao> {
    return apiFetch(`/v1/consignacoes/${id}`);
}

export async function listarParcelas(consignacaoId: string): Promise<{ data: Parcela[] }> {
    return apiFetch(`/v1/consignacoes/${consignacaoId}/parcelas`);
}

export async function criarConsignacao(data: {
    servidor_id: string;
    consignataria_id: string;
    produto_id: string;
    valor_solicitado: number;
    taxa_juros: number;
    quantidade_parcelas: number;
}): Promise<Consignacao> {
    return apiFetch('/v1/consignacoes', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function aprovarConsignacao(id: string): Promise<Consignacao> {
    return apiFetch(`/v1/consignacoes/${id}/aprovar`, {
        method: 'PUT',
        body: JSON.stringify({}),
    });
}

export async function ativarConsignacao(id: string): Promise<Consignacao> {
    return apiFetch(`/v1/consignacoes/${id}/ativar`, {
        method: 'PUT',
        body: JSON.stringify({}),
    });
}

export async function cancelarConsignacao(id: string): Promise<Consignacao> {
    return apiFetch(`/v1/consignacoes/${id}/cancelar`, {
        method: 'PUT',
        body: JSON.stringify({}),
    });
}

export async function quitarConsignacao(id: string): Promise<Consignacao> {
    return apiFetch(`/v1/consignacoes/${id}/quitar`, {
        method: 'PUT',
        body: JSON.stringify({}),
    });
}

export async function portarConsignacao(
    id: string,
    data: {
        consignataria_id_nova: string;
        produto_id_novo?: string;
        taxa_juros_nova?: number;
    }
): Promise<Consignacao> {
    return apiFetch(`/v1/consignacoes/${id}/portabilidade`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
