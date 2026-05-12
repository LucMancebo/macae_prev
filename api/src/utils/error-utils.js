"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorResponse = getErrorResponse;
exports.handleReplyError = handleReplyError;
const errors_1 = require("./errors");
function getErrorResponse(error, defaultMessage = 'Erro interno do servidor') {
    if ((0, errors_1.isAppError)(error)) {
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
function handleReplyError(reply, error, defaultMessage) {
    const { statusCode, body } = getErrorResponse(error, defaultMessage);
    return reply.status(statusCode).send(body);
}
