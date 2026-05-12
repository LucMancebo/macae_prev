import { prisma } from '../prisma/prisma';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script de Migração de Dados do Sistema Legado (POC 2)
 *
 * Lê CSVs exportados do sistema antigo e migra para o novo esquema relacional,
 * garantindo integridade referencial (Servidores, Consignatárias).
 */

const LEGACY_DATA_DIR = path.resolve(process.cwd(), 'api/legacy_data');

type CsvRow = Record<string, string>;

function normalizeLines(content: string) {
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function parseCSV(filePath: string): CsvRow[] {
    if (!fs.existsSync(filePath)) {
        console.warn(`[AVISO] Arquivo não encontrado: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = normalizeLines(content)
        .split('\n')
        .map((l) => l.trim())
        .filter((line) => line !== '');

    if (lines.length < 2) return [];

    const headers = lines[0]
        .split(';')
        .map((h) => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map((line) => {
        const values = line
            .split(';')
            .map((v) => v.trim().replace(/^"|"$/g, ''));

        return headers.reduce<CsvRow>((obj, header, index) => {
            obj[header] = values[index] ?? '';
            return obj;
        }, {});
    });
}

function toFloat(value: string | undefined) {
    const v = (value ?? '').trim();
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
}

async function migrarServidores() {
    console.log('🔄 Iniciando migração de Servidores...');
    const data = parseCSV(path.join(LEGACY_DATA_DIR, 'servidores.csv'));

    let count = 0;
    for (const row of data) {
        const cpf = (row.cpf ?? '').trim();
        const matricula = (row.matricula ?? '').trim();
        if (!cpf || !matricula) continue;

        const status = (row.status ?? '').trim() || 'ATIVO';

        await prisma.servidor.upsert({
            where: { cpf },
            update: {
                nome: row.nome ?? '',
                matricula,
                remuneracao_bruta: toFloat(row.remuneracao_bruta || row.salario_base),
                cargo: row.cargo ?? '',
                situacao_funcional: row.situacao_funcional ?? 'ATIVO',
                data_admissao: row.data_admissao
                    ? new Date(row.data_admissao)
                    : new Date('1970-01-01'),
                status: status as any,
            },
            create: {
                cpf,
                nome: row.nome ?? '',
                matricula,
                remuneracao_bruta: toFloat(row.remuneracao_bruta || row.salario_base),
                cargo: row.cargo ?? '',
                situacao_funcional: row.situacao_funcional ?? 'ATIVO',
                data_admissao: row.data_admissao ? new Date(row.data_admissao) : new Date('1970-01-01'),
                status: status as any,
            },
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
        const cnpj = (row.cnpj ?? '').trim();
        if (!cnpj) continue;

        await prisma.consignataria.upsert({
            where: { cnpj },
            update: {
                razao_social: row.razao_social ?? '',
                status: 'ATIVA',
            },
            create: {
                cnpj,
                razao_social: row.razao_social ?? '',
                nome_fantasia: row.nome_fantasia || row.razao_social || row.razao_social || '',
                tipo: 'BANCO',
                status: 'ATIVA',
            },
        });

        count++;
    }

    console.log(`✅ Migração de Consignatárias concluída! Total: ${count}`);
}

async function registrarAuditoriaMigracao() {
    const admin = await prisma.usuario.findFirst({
        where: { status: 'ATIVO' },
    });

    if (!admin) return;

    await prisma.logAuditoria.create({
        data: {
            usuario_id: admin.id,
            acao: 'MIGRACAO_SISTEMA_LEGADO',
            entidade: 'SISTEMA',
            dados_anteriores: {},
            entidade_id: admin.id,
            dados_novos: {
                status: 'SUCESSO',
                modulos: ['Servidores', 'Consignatarias'],
            },
            ip_origem: '127.0.0.1',
            user_agent: 'CLI-Migration-Script',
        },
    });
}

async function main() {
    console.log('==================================================');
    console.log('🚀 SCRIPT DE MIGRAÇÃO LEGADO MACAEPREV (POC 2) 🚀');
    console.log('==================================================\n');

    try {
        if (!fs.existsSync(LEGACY_DATA_DIR)) {
            fs.mkdirSync(LEGACY_DATA_DIR, { recursive: true });
            console.log(`📁 Pasta criada em ${LEGACY_DATA_DIR}. Coloque seus arquivos .csv nela.`);
        }

        await migrarConsignatarias();
        await migrarServidores();
        await registrarAuditoriaMigracao();

        console.log('\n🎉 MIGRAÇÃO FINALIZADA COM SUCESSO! (POC 2 Concluída)');
    } catch (error) {
        console.error('❌ Erro crítico durante a migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

