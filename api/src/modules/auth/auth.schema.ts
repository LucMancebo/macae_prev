export const loginSchema = {
    summary: 'Realizar login',
    description: 'Autentica o usuário com e-mail e senha. Retorna token ou desafio MFA/LGPD.',
    tags: ['Autenticação'],
    body: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
            email: { type: 'string', format: 'email' },
            senha: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                mfa_requerido: { type: 'boolean' },
                termos_requeridos: { type: 'boolean' },
                usuarioId: { type: 'string' }
            }
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string' }
            }
        }
    }
};

export const loginMfaSchema = {
    summary: 'Finalizar login com MFA',
    description: 'Valida o código TOTP de 6 dígitos após o login inicial.',
    tags: ['Autenticação'],
    body: {
        type: 'object',
        required: ['usuarioId', 'code'],
        properties: {
            usuarioId: { type: 'string', format: 'uuid' },
            code: { type: 'string', minLength: 6, maxLength: 6 }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                token: { type: 'string' }
            }
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string' }
            }
        }
    }
};

export const acceptTermsSchema = {
    summary: 'Aceitar termos LGPD',
    description: 'Registra o consentimento do usuário para uma versão do termo.',
    tags: ['LGPD'],
    body: {
        type: 'object',
        required: ['usuarioId', 'termoId'],
        properties: {
            usuarioId: { type: 'string', format: 'uuid' },
            termoId: { type: 'string', format: 'uuid' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
};
