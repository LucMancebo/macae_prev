import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const fromParts = (() => {
    const host = process.env.POSTGRES_HOST || process.env.PGHOST;
    const user = process.env.POSTGRES_USER || process.env.PGUSER;
    const password = process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD;
    const database = process.env.POSTGRES_DATABASE || process.env.PGDATABASE;

    if (!host || !user || !password || !database) return undefined;

    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
})();

const connectionString =
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    fromParts;

if (!connectionString) {
    throw new Error(
        'Variável de banco não encontrada. Configure DATABASE_URL/DIRECT_URL ou POSTGRES_PRISMA_URL/POSTGRES_URL.'
    );
}

const sql = neon(connectionString);
const adapter = new PrismaNeon(sql as any);
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter: adapter as any,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;