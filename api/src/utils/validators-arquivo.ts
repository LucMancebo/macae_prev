/**
 * Utilitários para Validação de Arquivo
 * - Cálculo de checksums (MD5, SHA256)
 * - Detecção de duplicação
 * - Validação de arquivo (tamanho, encoding, etc)
 */

import crypto from 'crypto';

// ============================================================================
// CHECKSUM
// ============================================================================

export function calcularMD5(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
}

export function calcularSHA256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function verificarMD5(buffer: Buffer, md5Esperado: string): boolean {
    const md5Calculado = calcularMD5(buffer);
    return md5Calculado === md5Esperado.toLowerCase();
}

export function verificarSHA256(buffer: Buffer, sha256Esperado: string): boolean {
    const sha256Calculado = calcularSHA256(buffer);
    return sha256Calculado === sha256Esperado.toLowerCase();
}

// ============================================================================
// VALIDAÇÃO DE ARQUIVO
// ============================================================================

export interface ValidacaoArquivoResult {
    valido: boolean;
    tamanho_bytes: number;
    tamanho_mb: number;
    erros: string[];
    avisos: string[];
    checksum_md5: string;
    checksum_sha256: string;
}

export async function validarArquivo(
    buffer: Buffer,
    opcoes: {
        maxTamanoMB?: number;
        checksum_md5?: string;
        checksum_sha256?: string;
    } = {}
): Promise<ValidacaoArquivoResult> {
    const maxTamanoMB = opcoes.maxTamanoMB || 10;
    const maxTamanoBytes = maxTamanoMB * 1024 * 1024;

    const resultado: ValidacaoArquivoResult = {
        valido: true,
        tamanho_bytes: buffer.length,
        tamanho_mb: buffer.length / (1024 * 1024),
        erros: [],
        avisos: [],
        checksum_md5: calcularMD5(buffer),
        checksum_sha256: calcularSHA256(buffer)
    };

    // Validar tamanho
    if (buffer.length === 0) {
        resultado.erros.push('Arquivo vazio');
        resultado.valido = false;
    } else if (buffer.length > maxTamanoBytes) {
        resultado.erros.push(`Arquivo excede o tamanho máximo de ${maxTamanoMB}MB (tamanho atual: ${resultado.tamanho_mb.toFixed(2)}MB)`);
        resultado.valido = false;
    }

    // Validar checksum MD5
    if (opcoes.checksum_md5) {
        if (!verificarMD5(buffer, opcoes.checksum_md5)) {
            resultado.erros.push(`Checksum MD5 não corresponde. Esperado: ${opcoes.checksum_md5}, Obtido: ${resultado.checksum_md5}`);
            resultado.valido = false;
        }
    }

    // Validar checksum SHA256
    if (opcoes.checksum_sha256) {
        if (!verificarSHA256(buffer, opcoes.checksum_sha256)) {
            resultado.erros.push(`Checksum SHA256 não corresponde. Esperado: ${opcoes.checksum_sha256}, Obtido: ${resultado.checksum_sha256}`);
            resultado.valido = false;
        }
    }

    // Avisos
    if (resultado.tamanho_mb > 5) {
        resultado.avisos.push(`Arquivo grande (${resultado.tamanho_mb.toFixed(2)}MB). O processamento pode levar tempo.`);
    }

    return resultado;
}

// ============================================================================
// VALIDAÇÃO DE NOME DE ARQUIVO
// ============================================================================

export function validarNomeArquivo(nome: string, tipo: 'FOLHA' | 'RETORNO' | 'LEGADO'): { valido: boolean; erro?: string } {
    // Padrão esperado
    const padroesEsperados: Record<string, RegExp> = {
        FOLHA: /^FOLHA_CONSIGNACOES_MACAEPREV_\d{6}_\d{6}\.csv$/i,
        RETORNO: /^FOLHA_RETORNO_MACAEPREV_\d{6}_\d{6}\.csv$/i,
        LEGADO: /^.*\.csv$/i
    };

    const padraoEsperado = padroesEsperados[tipo];

    if (!padraoEsperado.test(nome)) {
        return {
            valido: false,
            erro: `Nome de arquivo não corresponde ao padrão esperado para tipo ${tipo}. Padrão: ${padraoEsperado.toString()}`
        };
    }

    // Validar caracteres proibidos
    if (/[<>:"|?*]/.test(nome)) {
        return {
            valido: false,
            erro: 'Nome de arquivo contém caracteres proibidos: < > : " | ? *'
        };
    }

    // Validar extensão
    if (!nome.toLowerCase().endsWith('.csv')) {
        return {
            valido: false,
            erro: 'Arquivo deve ter extensão .csv'
        };
    }

    return { valido: true };
}

// ============================================================================
// DETECÇÃO DE DUPLICAÇÃO
// ============================================================================

export async function detectarDuplicacao(
    buffer: Buffer,
    checksumsExistentes: { md5: string; sha256: string }[]
): Promise<{ duplicado: boolean; razao?: string }> {
    const md5Novo = calcularMD5(buffer);
    const sha256Novo = calcularSHA256(buffer);

    for (const checksum of checksumsExistentes) {
        if (checksum.md5 === md5Novo) {
            return { duplicado: true, razao: 'Arquivo com mesmo conteúdo (MD5) já foi processado' };
        }

        if (checksum.sha256 === sha256Novo) {
            return { duplicado: true, razao: 'Arquivo com mesmo conteúdo (SHA256) já foi processado' };
        }
    }

    return { duplicado: false };
}

// ============================================================================
// GERAÇÃO DE NOME DE ARQUIVO AUTOMÁTICO
// ============================================================================

export function gerarNomeArquivo(tipo: 'FOLHA' | 'RETORNO'): string {
    const agora = new Date();
    const yyyymm = agora.toISOString().slice(0, 7).replace('-', '');
    const hhmmss = agora.toISOString().slice(11, 19).replace(/:/g, '');

    if (tipo === 'FOLHA') {
        return `FOLHA_CONSIGNACOES_MACAEPREV_${yyyymm}_${hhmmss}.csv`;
    } else {
        return `FOLHA_RETORNO_MACAEPREV_${yyyymm}_${hhmmss}.csv`;
    }
}

// ============================================================================
// BACKUP DE ARQUIVO
// ============================================================================

export function gerarNomeBackup(nomeOriginal: string): string {
    const agora = Date.now();
    const ext = nomeOriginal.split('.').pop();
    const sem_ext = nomeOriginal.slice(0, -(ext?.length || 0) - 1);
    return `${sem_ext}.${agora}.${ext}.bak`;
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
    calcularMD5,
    calcularSHA256,
    verificarMD5,
    verificarSHA256,
    validarArquivo,
    validarNomeArquivo,
    detectarDuplicacao,
    gerarNomeArquivo,
    gerarNomeBackup
};
