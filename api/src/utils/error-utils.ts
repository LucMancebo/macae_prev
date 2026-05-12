import { FastifyReply } from 'fastify';
import { isAppError, AppError } from './errors';

export function getErrorResponse(error: unknown, defaultMessage = 'Erro interno do servidor') {
    if (isAppError(error)) {
        return {
            statusCode: error.statusCode || 500,
            body: {
                error: {
                    code: error.code || 'APP_ERROR',
                    message: error.message,
                    details: error.details
                }
            }
        };
    }

    if (error instanceof Error) {
        return {
            statusCode: 500,
            body: {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: error.message || defaultMessage
                }
            }
        };
    }

    return {
        statusCode: 500,
        body: {
            error: {
                code: 'INTERNAL_ERROR',
                message: defaultMessage
            }
        }
    };
}

export function handleReplyError(reply: FastifyReply, error: unknown, defaultMessage?: string) {
    const { statusCode, body } = getErrorResponse(error, defaultMessage);
    return reply.status(statusCode).send(body);
}
