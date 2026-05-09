import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './api/src/config/database';

async function testConnection() {
    console.log('🔍 Tentando conectar ao Neon...');
    console.log('🔗 URL detectada:', process.env.DATABASE_URL?.split('@')[1] || 'NENHUMA');

    try {
        // Tenta estabelecer a conexão
        await prisma.$connect();
        console.log('✅ Sucesso: Conexão estabelecida!');

        // Executa uma query simples de teste
        const result = await prisma.$queryRaw`SELECT NOW() as server_time, version() as pg_version`;
        console.log('📊 Dados do servidor:', result);

        // Verifica se o admin existe
        const admin = await prisma.usuario.findUnique({
            where: { email: 'admin@macaeprev.rj.gov.br' },
            include: { perfil: true }
        });
        console.log('👤 Usuário Admin encontrado:', admin ? 'SIM' : 'NÃO');

    } catch (error) {
        console.error('❌ Erro na conexão:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();