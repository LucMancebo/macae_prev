import { apiFetch } from './api';

export interface Margem {
    id: string;
    consignataria_id: string;
    nome: string;
    tipo: 'EXCLUSIVA' | 'COMPARTILHADA';
    percentual_maximo: number;
    status: 'ATIVA' | 'INATIVA' | 'BLOQUEADA';
    data_criacao: string;
    data_atualizacao: string;
    consignataria?: { id: string; razao_social: string };
}

export interface MargemServidor {
    id: string;
    margem_id: string;
    servidor_id: string;
    valor_limite: number;
    valor_reservado: number;
    valor_utilizado: number;
    valor_disponivel: number;
    percentual_utilizacao: number;
}

export interface DisponibilidadeMaragem {
    total_alocado: number;
    utilizado: number;
    disponivel: number;
    percentual_utilizacao: number;
}

export interface PaginatedMargens {
    data: Margem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export async function listarMargens(
    page: number = 1,
    limit: number = 10,
    filters?: {
        consignataria_id?: string;
        status?: string;
    }
): Promise<PaginatedMargens> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.consignataria_id) params.append('consignataria_id', filters.consignataria_id);
    if (filters?.status) params.append('status', filters.status);

    return apiFetch(`/v1/margens?${params.toString()}`);
}

export async function buscarMargem(id: string): Promise<Margem> {
    return apiFetch(`/v1/margens/${id}`);
}

export async function consultarDisponibilidade(id: string): Promise<DisponibilidadeMaragem> {
    return apiFetch(`/v1/margens/${id}/disponibilidade`);
}

export async function criarMargem(data: {
    consignataria_id: string;
    nome: string;
    tipo: string;
    percentual_maximo: number;
    status: string;
}): Promise<Margem> {
    return apiFetch('/v1/margens', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function atualizarMargem(
    id: string,
    data: Partial<Margem>
): Promise<Margem> {
    return apiFetch(`/v1/margens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function bloquearMargem(id: string): Promise<Margem> {
    return apiFetch(`/v1/margens/${id}/bloquear`, {
        method: 'PUT',
        body: JSON.stringify({}),
    });
}

export async function desbloquearMargem(id: string): Promise<Margem> {
    return apiFetch(`/v1/margens/${id}/desbloquear`, {
        method: 'PUT',
        body: JSON.stringify({}),
    });
}

export async function deletarMargem(id: string): Promise<void> {
    return apiFetch(`/v1/margens/${id}`, {
        method: 'DELETE',
    });
}
