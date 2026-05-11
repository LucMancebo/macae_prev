import { apiFetch } from "./api";

export interface Consignataria {
    id: string;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
    email: string;
    responsavel: string;
    cargo_responsavel: string;
    status: "ATIVA" | "INATIVA";
    created_at: string;
    updated_at: string;
}

export interface PaginatedConsignatarias {
    items: Consignataria[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export async function listarConsignatarias(
    page: number = 1,
    limit: number = 10,
    status?: string
): Promise<PaginatedConsignatarias> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);

    return apiFetch(`/v1/consignatarias?${params.toString()}`, {
        method: "GET",
    });
}

export async function buscarConsignataria(id: string): Promise<Consignataria> {
    return apiFetch(`/v1/consignatarias/${id}`, {
        method: "GET",
    });
}

export async function criarConsignataria(
    data: Omit<Consignataria, "id" | "created_at" | "updated_at">
): Promise<Consignataria> {
    return apiFetch("/v1/consignatarias", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function atualizarConsignataria(
    id: string,
    data: Partial<Omit<Consignataria, "id" | "created_at" | "updated_at">>
): Promise<Consignataria> {
    return apiFetch(`/v1/consignatarias/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deletarConsignataria(id: string): Promise<void> {
    return apiFetch(`/v1/consignatarias/${id}`, {
        method: "DELETE",
    });
}
