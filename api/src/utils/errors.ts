/**
 * Tipos de erro para o backend
 */

export interface ApiErrorDTO {
    message: string;
    code?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: Record<string, unknown>;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = "INTERNAL_ERROR",
        details?: Record<string, unknown>,
    ) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(message, 400, "VALIDATION_ERROR", details);
        this.name = "ValidationError";
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} com ID ${id} não encontrado`
            : `${resource} não encontrado`;
        super(message, 404, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}

/**
 * Type guard para verificar se é AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}
