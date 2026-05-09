"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, request, reply) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erro interno do servidor';
    // Log do erro
    request.server.log.error({
        statusCode,
        message,
        url: request.url,
        method: request.method,
        error: error.stack,
        params: request.params,
        query: request.query
    });
    // Resposta padronizada de erro
    return reply.status(statusCode).send({
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message,
            timestamp: new Date().toISOString(),
            requestId: request.id
        }
    });
};
exports.errorHandler = errorHandler;
