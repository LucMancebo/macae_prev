import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const errorHandler = (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erro interno do servidor';

    // Log do erro
    request.server.log.error({
        statusCode,
        message,
        url: request.url,
        method: request.method,
        error: error.stack
    });

    // Resposta padronizada de erro
    return reply.status(statusCode).send({
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message,
            statusCode,
            timestamp: new Date().toISOString()
        }
    });
};
