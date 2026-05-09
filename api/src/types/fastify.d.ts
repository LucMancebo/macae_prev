import { FastifyRequest } from 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            nome: string;
            perfil: string;
            consignataria_id?: string;
        };
    }

    interface FastifyReply {
        setCookie(name: string, value: string, options?: Record<string, unknown>): FastifyReply;
        clearCookie(name: string, options?: Record<string, unknown>): FastifyReply;
    }
}
