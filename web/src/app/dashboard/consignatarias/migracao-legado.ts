import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Script de Migração de Dados do Sistema Legado (POC 2)
 * 
 * Este script lê arquivos CSV exportados do sistema antigo e os migra
 * para o novo esquema relacional do MACAEPREV, garantindo a integridade
 * referencial (Servidores, Consignatárias e Contratos).
 */

const LEGACY_DATA_DIR = path.resolve(__dirname, '../../legacy_data');

function parseCSV(filePath: string): Array<Record<string, string>> {
    if (!fs.existsSync(filePath)) {
        console.warn(`[AVISO] Arquivo não encontrado: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map(line => {
        const values = line.split(';').map(v => v.trim().replace(/^"|"$/g, ''));
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {} as Record<string, string>);
    });
}

async function migrarServidores() {
    console.log('🔄 Iniciando migração de Servidores...');
    const data = parseCSV(path.join(LEGACY_DATA_DIR, 'servidores.csv'));

    let count = 0;
    for (const row of data) {
        if (!row.cpf || !row.matricula) continue;

        await prisma.servidor.upsert({
            where: { cpf: row.cpf },
            update: {
                nome: row.nome,
                matricula: row.matricula,
                salario_base: parseFloat(row.salario_base || '0'),
                status: row.status as any || 'ATIVO',
            },
            create: {
                cpf: row.cpf,
                nome: row.nome,
                matricula: row.matricula,
                salario_base: parseFloat(row.salario_base || '0'),
                status: row.status as any || 'ATIVO',
                data_nascimento: row.data_nascimento ? new Date(row.data_nascimento) : null,
            }
        });
        count++;
    }
    console.log(`✅ Migração de Servidores concluída! Total: ${count}`);
}

async function migrarConsignatarias() {
    console.log('🔄 Iniciando migração de Consignatárias...');
    const data = parseCSV(path.join(LEGACY_DATA_DIR, 'consignatarias.csv'));

    let count = 0;
    for (const row of data) {
        if (!row.cnpj) continue;

        await prisma.consignataria.upsert({
            where: { cnpj: row.cnpj },
            update: {
                razao_social: row.razao_social,
                status: 'ATIVA',
            },
            create: {
                cnpj: row.cnpj,
                razao_social: row.razao_social,
                nome_fantasia: row.nome_fantasia || row.razao_social,
                tipo: 'BANCO',
                status: 'ATIVA',
            }
        });
        count++;
    }
    console.log(`✅ Migração de Consignatárias concluída! Total: ${count}`);
}

async function registrarAuditoriaMigracao() {
    // Busca o primeiro usuário admin para atrelar a auditoria
    const admin = await prisma.usuario.findFirst({ where: { status: 'ATIVO' } });
    if (admin) {
        await prisma.logAuditoria.create({
            data: {
                usuario_id: admin.id,
                acao: 'MIGRACAO_SISTEMA_LEGADO',
                entidade: 'SISTEMA',
                dados_anteriores: {},
                dados_novos: { status: 'SUCESSO', modulos: ['Servidores', 'Consignatarias'] },
                ip_origem: '127.0.0.1',
                user_agent: 'CLI-Migration-Script',
            }
        });
    }
}

async function main() {
    console.log('==================================================');
    console.log('🚀 SCRIPT DE MIGRAÇÃO LEGADO MACAEPREV (POC 2) 🚀');
    console.log('==================================================\n');

    try {
        // Cria a pasta caso o desenvolvedor precise testar a injeção local
        if (!fs.existsSync(LEGACY_DATA_DIR)) {
            fs.mkdirSync(LEGACY_DATA_DIR, { recursive: true });
            console.log(`📁 Pasta criada em ${LEGACY_DATA_DIR}. Coloque seus arquivos .csv nela.`);
        }

        await migrarConsignatarias();
        await migrarServidores();
        await registrarAuditoriaMigracao();

        console.log('\n🎉 MIGRACAO FINALIZADA COM SUCESSO! (POC 2 Concluída)');
    } catch (error) {
        console.error('❌ Erro crítico durante a migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();