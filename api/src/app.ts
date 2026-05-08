import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes } from './modules/auth/auth.routes';
import { servidoresRoutes } from './modules/servidores/servidores.routes';
import { consignatariasRoutes } from './modules/consignatarias/consignatarias.routes';
import { usuariosRoutes } from './modules/usuarios/usuarios.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { errorHandler } from './hooks/error-handler';

export const buildApp = (): FastifyInstance => {
    const app = Fastify({
        ignoreTrailingSlash: true,
        logger:
            process.env.NODE_ENV === 'production'
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
    const originSource =
        process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000';
    const allowedOrigins = originSource
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    const corsOrigin = allowedOrigins.includes('*') ? true : allowedOrigins;

    app.register(cors, {
        origin: corsOrigin,
        credentials: true
    });

    // Configuração do JWT (Segurança)
    app.register(jwt, {
        secret:
            process.env.JWT_SECRET || 'macae_prev_super_secret_dev_key_change_me'
    });

    // Configuração do Swagger (Documentação)
    app.register(swagger, {
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

    app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        }
    });

    // ========== ERROR HANDLER CENTRALIZADO ==========
    app.setErrorHandler(errorHandler);

    // Rota raiz (healthcheck)
    app.get('/health', async (request, reply) => {
        return { status: 'OK', timestamp: new Date().toISOString() };
    });

    // ========== ROTAS DA APLICAÇÃO ==========
    app.register(authRoutes, { prefix: '/v1/auth' });
    app.register(servidoresRoutes, { prefix: '/v1/servidores' });
    app.register(consignatariasRoutes, { prefix: '/v1/consignatarias' });
    app.register(usuariosRoutes, { prefix: '/v1/usuarios' });
    app.register(auditRoutes, { prefix: '/v1/audit' });

    return app;
};
