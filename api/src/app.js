"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const servidores_routes_1 = require("./modules/servidores/servidores.routes");
const consignatarias_routes_1 = require("./modules/consignatarias/consignatarias.routes");
const usuarios_routes_1 = require("./modules/usuarios/usuarios.routes");
const audit_routes_1 = require("./modules/audit/audit.routes");
const error_handler_1 = require("./hooks/error-handler");
const buildApp = () => {
    const app = (0, fastify_1.default)({
        ignoreTrailingSlash: true,
        logger: process.env.NODE_ENV === 'production'
            ? true
            : {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        translateTime: 'SYS:standard',
                        ignore: 'pid,hostname'
                    }
                }
            }
    });
    // CORS seguro: whitelist apenas o frontend autorizado
    const originSource = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000';
    const allowedOrigins = originSource
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    const corsOrigin = allowedOrigins.includes('*') ? true : allowedOrigins;
    app.register(cors_1.default, {
        origin: corsOrigin,
        credentials: true
    });
    // Configuração do JWT (Segurança)
    app.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || 'macae_prev_super_secret_dev_key_change_me'
    });
    // Configuração do Swagger (Documentação)
    app.register(swagger_1.default, {
        openapi: {
            info: {
                title: 'MACAEPREV — API de Consignações',
                description: 'Documentação da API do sistema de controle de consignações',
                version: '1.0.0'
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    });
    app.register(swagger_ui_1.default, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        }
    });
    // ========== ERROR HANDLER CENTRALIZADO ==========
    app.setErrorHandler(error_handler_1.errorHandler);
    // Rota raiz (healthcheck)
    app.get('/health', async (request, reply) => {
        return { status: 'OK', timestamp: new Date().toISOString() };
    });
    // ========== ROTAS DA APLICAÇÃO ==========
    app.register(auth_routes_1.authRoutes, { prefix: '/v1/auth' });
    app.register(servidores_routes_1.servidoresRoutes, { prefix: '/v1/servidores' });
    app.register(consignatarias_routes_1.consignatariasRoutes, { prefix: '/v1/consignatarias' });
    app.register(usuarios_routes_1.usuariosRoutes, { prefix: '/v1/usuarios' });
    app.register(audit_routes_1.auditRoutes, { prefix: '/v1/audit' });
    return app;
};
exports.buildApp = buildApp;
