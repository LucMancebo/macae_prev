"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_neon_1 = require("@prisma/adapter-neon");
const serverless_1 = require("@neondatabase/serverless");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fromParts = (() => {
    const host = process.env.POSTGRES_HOST || process.env.PGHOST;
    const user = process.env.POSTGRES_USER || process.env.PGUSER;
    const password = process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD;
    const database = process.env.POSTGRES_DATABASE || process.env.PGDATABASE;
    if (!host || !user || !password || !database)
        return undefined;
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
})();
const connectionString = process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    fromParts;
if (!connectionString) {
    throw new Error('Variável de banco não encontrada. Configure DATABASE_URL/DIRECT_URL ou POSTGRES_PRISMA_URL/POSTGRES_URL.');
}
const pool = new serverless_1.Pool({ connectionString: connectionString });
const adapter = new adapter_neon_1.PrismaNeon(pool);
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        adapter: adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
