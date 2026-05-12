"use strict";
/**
 * Utilitários para Validação de Arquivo
 * - Cálculo de checksums (MD5, SHA256)
 * - Detecção de duplicação
 * - Validação de arquivo (tamanho, encoding, etc)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularMD5 = calcularMD5;
exports.calcularSHA256 = calcularSHA256;
exports.verificarMD5 = verificarMD5;
exports.verificarSHA256 = verificarSHA256;
exports.validarArquivo = validarArquivo;
exports.validarNomeArquivo = validarNomeArquivo;
exports.detectarDuplicacao = detectarDuplicacao;
exports.gerarNomeArquivo = gerarNomeArquivo;
exports.gerarNomeBackup = gerarNomeBackup;
const crypto_1 = __importDefault(require("crypto"));
// ============================================================================
// CHECKSUM
// ============================================================================
function calcularMD5(buffer) {
    return crypto_1.default.createHash('md5').update(buffer).digest('hex');
}
function calcularSHA256(buffer) {
    return crypto_1.default.createHash('sha256').update(buffer).digest('hex');
}
function verificarMD5(buffer, md5Esperado) {
    const md5Calculado = calcularMD5(buffer);
    return md5Calculado === md5Esperado.toLowerCase();
}
function verificarSHA256(buffer, sha256Esperado) {
    const sha256Calculado = calcularSHA256(buffer);
    return sha256Calculado === sha256Esperado.toLowerCase();
}
async function validarArquivo(buffer, opcoes = {}) {
    const maxTamanoMB = opcoes.maxTamanoMB || 10;
    const maxTamanoBytes = maxTamanoMB * 1024 * 1024;
    const resultado = {
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
    }
    else if (buffer.length > maxTamanoBytes) {
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
function validarNomeArquivo(nome, tipo) {
    // Padrão esperado
    const padroesEsperados = {
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
async function detectarDuplicacao(buffer, checksumsExistentes) {
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
function gerarNomeArquivo(tipo) {
    const agora = new Date();
    const yyyymm = agora.toISOString().slice(0, 7).replace('-', '');
    const hhmmss = agora.toISOString().slice(11, 19).replace(/:/g, '');
    if (tipo === 'FOLHA') {
        return `FOLHA_CONSIGNACOES_MACAEPREV_${yyyymm}_${hhmmss}.csv`;
    }
    else {
        return `FOLHA_RETORNO_MACAEPREV_${yyyymm}_${hhmmss}.csv`;
    }
}
// ============================================================================
// BACKUP DE ARQUIVO
// ============================================================================
function gerarNomeBackup(nomeOriginal) {
    const agora = Date.now();
    const ext = nomeOriginal.split('.').pop();
    const sem_ext = nomeOriginal.slice(0, -(ext?.length || 0) - 1);
    return `${sem_ext}.${agora}.${ext}.bak`;
}
// ============================================================================
// EXPORT
// ============================================================================
exports.default = {
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
