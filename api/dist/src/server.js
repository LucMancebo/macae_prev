"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const database_1 = require("./config/database");
let app = null;
const startServer = async () => {
    app = (0, app_1.buildApp)();
    const basePort = Number(process.env.PORT) || 3333;
    const maxRetries = 3;
    try {
        // Tenta conectar ao banco de dados via Prisma antes de aceitar requisições
        await database_1.prisma.$connect();
        app.log.info('Banco de dados conectado com sucesso (Prisma).');
        let port = basePort;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await app.listen({ port, host: '0.0.0.0' });
                app.log.info(`Servidor MACAEPREV rodando na porta ${port}`);
                return;
            }
            catch (err) {
                // Tratamento específico para porta ocupada
                if (err && err.code === 'EADDRINUSE') {
                    app.log.error(`Porta ${port} já em uso (EADDRINUSE).`);
                    if (attempt < maxRetries) {
                        port = basePort + attempt + 1;
                        app.log.info(`Tentando porta alternativa ${port} (tentativa ${attempt + 1}/${maxRetries})`);
                        // pequena espera antes de tentar novamente
                        await new Promise((r) => setTimeout(r, 500));
                        continue;
                    }
                    app.log.error('Todas as tentativas de porta falharam. Encerrando processo.');
                    await database_1.prisma.$disconnect();
                    process.exit(1);
                }
                throw err;
            }
        }
    }
    catch (error) {
        app?.log.error(error instanceof Error ? error : new Error(String(error)), 'Erro ao iniciar o servidor');
        await database_1.prisma.$disconnect();
        process.exit(1);
    }
};
const gracefulShutdown = async (reason) => {
    console.log('Finalizando processos...', reason ?? 'signal');
    try {
        if (app) {
            await app.close();
            app.log.info('Fastify encerrado com sucesso');
        }
    }
    catch (e) {
        console.error('Erro ao fechar Fastify:', e);
    }
    try {
        await database_1.prisma.$disconnect();
    }
    catch (e) {
        console.error('Erro ao desconectar Prisma:', e);
    }
    process.exit(0);
};
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    void gracefulShutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    void gracefulShutdown('uncaughtException');
});
startServer();
