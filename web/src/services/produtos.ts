import { apiFetch } from './api';

export interface Produto {
    id: string;
    consignataria_id: string;
    nome: string;
    tipo: 'EMPRESTIMO' | 'CARTAO' | 'PLANO_SAUDE' | 'SEGURO' | 'MENSALIDADE' | 'OUTROS';
    taxa_minima: number;
    taxa_maxima: number;
    averbacao: 'NOMINAL' | 'PERCENTUAL';
    prazo_minimo: number;
    prazo_maximo: number;
    status: 'ATIVO' | 'INATIVO';
    data_criacao: string;
    data_atualizacao: string;
    consignataria?: { id: string; razao_social: string };
}

export interface PaginatedProdutos {
    data: Produto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export async function listarProdutos(
    page: number = 1,
    limit: number = 10,
    filters?: {
        consignataria_id?: string;
        tipo?: string;
        status?: string;
    }
): Promise<PaginatedProdutos> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.consignataria_id) params.append('consignataria_id', filters.consignataria_id);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.status) params.append('status', filters.status);

    return apiFetch(`/v1/produtos?${params.toString()}`);
}

export async function buscarProduto(id: string): Promise<Produto> {
    return apiFetch(`/v1/produtos/${id}`);
}

export async function criarProduto(data: {
    consignataria_id: string;
    nome: string;
    tipo: string;
    taxa_minima: number;
    taxa_maxima: number;
    averbacao: string;
    prazo_minimo: number;
    prazo_maximo: number;
}): Promise<Produto> {
    return apiFetch('/v1/produtos', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function atualizarProduto(
    id: string,
    data: Partial<Produto>
): Promise<Produto> {
    return apiFetch(`/v1/produtos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deletarProduto(id: string): Promise<void> {
    return apiFetch(`/v1/produtos/${id}`, {
        method: 'DELETE',
    });
}
