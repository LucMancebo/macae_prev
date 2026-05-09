const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/v1').replace(/\/+$/, '');

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('macae_prev_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
        ...options,
        headers,
    });

    const rawBody = await response.text();
    let data: unknown = null;

    try {
        data = rawBody ? JSON.parse(rawBody) : null;
    } catch {
        data = { message: rawBody || 'Erro inesperado na API.' };
    }

    if (!response.ok) {
        throw data;
    }

    return data as T;
}
