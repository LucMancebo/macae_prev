"use strict";
/**
 * Tipos de erro para o backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
exports.isAppError = isAppError;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, "VALIDATION_ERROR", details);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource, id) {
        const message = id
            ? `${resource} com ID ${id} não encontrado`
            : `${resource} não encontrado`;
        super(message, 404, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Type guard para verificar se é AppError
 */
function isAppError(error) {
    return error instanceof AppError;
}
