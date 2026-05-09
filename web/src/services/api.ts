const DEFAULT_LOCAL = 'http://localhost:3333/v1';

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Determina a base da API em tempo de execução:
    // - Se `NEXT_PUBLIC_API_URL` estiver definido (útil em dev e CI), usa-o.
    // - No navegador em produção (Vercel), usamos o caminho relativo `/api/v1`.
    // - Em ambiente server (SSG/SSR) sem variável, usamos localhost para dev.
    const envApi = process.env.NEXT_PUBLIC_API_URL;
    const base = envApi
        ? envApi.replace(/\/+$/, '')
        : typeof window !== 'undefined'
            ? `${window.location.origin}/api/v1`
            : DEFAULT_LOCAL;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${base}${normalizedEndpoint}`, {
        ...options,
        credentials: 'include',
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
        const message =
            (data && typeof data === 'object' && (data as any).message) ||
            (data && typeof data === 'object' && (data as any).error) ||
            response.statusText ||
            'Erro inesperado na API.';

        const err: any = new Error(String(message));
        err.status = response.status;
        err.statusCode = response.status;
        err.body = data;
        throw err;
    }

    return data as T;
}
