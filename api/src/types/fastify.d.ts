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
}
