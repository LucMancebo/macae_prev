export interface User {
    id: string;
    email: string;
    nome: string;
    perfil: string;
    consignataria_id?: string | null;
}

export interface AuthResponse {
    token: string;
    usuarioId: string;
    mfa_requerido?: boolean;
    termos_requeridos?: boolean;
}

export interface MeResponse {
    user: User;
}

export interface AuthError {
    error: {
        code: string;
        message: string;
        statusCode: number;
        timestamp: string;
    };
}
