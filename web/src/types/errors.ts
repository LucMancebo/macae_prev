/**
 * Tipos de erro e exceção para a aplicação
 */

export interface ApiErrorResponse {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
}

export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly details?: Record<string, any>;

    constructor(
        message: string,
        status: number = 500,
        code?: string,
        details?: Record<string, any>,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

/**
 * Verifica se um erro é do tipo ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Extrai mensagem de erro de qualquer tipo
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "Erro desconhecido";
}
