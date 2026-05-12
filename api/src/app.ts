import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes } from './modules/auth/auth.routes';
import { servidoresRoutes } from './modules/servidores/servidores.routes';
import { consignatariasRoutes } from './modules/consignatarias/consignatarias.routes';
import { usuariosRoutes } from './modules/usuarios/usuarios.routes';
import { produtosRoutes } from './modules/produtos/produtos.routes';
import { margensRoutes } from './modules/margens/margens.routes';
import { consignacoesRoutes } from './modules/consignacoes/consignacoes.routes';
import { arquivosRoutes } from './modules/arquivos/arquivo.routes';
import { reconciliacaoRoutes } from './modules/reconciliacao/reconciliacao.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { errorHandler } from './hooks/error-handler';

export const buildApp = (): FastifyInstance => {
    const app = Fastify({
        routerOptions: {
            ignoreTrailingSlash: true
        },
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

    const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.register(cookie);

    // CORS seguro: whitelist apenas o frontend autorizado
    app.register(cors, {
        origin: (origin, cb) => {
            if (!origin) {
                cb(null, true);
                return;
            }

            cb(null, allowedOrigins.includes(origin));
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        exposedHeaders: ['Authorization']
    });

    // Configuração do JWT (Segurança)
    app.register(jwt, {
        secret: process.env.JWT_SECRET || 'sua-chave-secreta-jwt-super-segura-aqui-min-32-chars',
        cookie: {
            cookieName: 'macae_prev_token',
            signed: false
        }
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
    app.register(produtosRoutes, { prefix: '/v1/produtos' });
    app.register(margensRoutes, { prefix: '/v1/margens' });
    app.register(consignacoesRoutes, { prefix: '/v1/consignacoes' });
    app.register(arquivosRoutes, { prefix: '/v1/arquivos' });
    app.register(reconciliacaoRoutes, { prefix: '/v1/reconciliacao' });
    app.register(usuariosRoutes, { prefix: '/v1/usuarios' });
    app.register(auditRoutes, { prefix: '/v1/audit' });

    return app;
};
