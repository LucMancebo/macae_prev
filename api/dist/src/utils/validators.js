"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCPF = validarCPF;
exports.formatarCPF = formatarCPF;
exports.validarCNPJ = validarCNPJ;
exports.formatarCNPJ = formatarCNPJ;
/**
 * Valida se um CPF é matematicamente válido
 */
function validarCPF(cpf) {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11)
        return false;
    // Elimina CPFs conhecidos inválidos
    if (/^(\d)\1{10}$/.test(cleanCPF))
        return false;
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10)))
        return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11)))
        return false;
    return true;
}
/**
 * Formata CPF para o padrão 000.000.000-00
 */
function formatarCPF(cpf) {
    const clean = cpf.replace(/\D/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
/**
 * Valida se um CNPJ é matematicamente válido
 */
function validarCNPJ(cnpj) {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14)
        return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ))
        return false;
    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    const digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2)
            pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0)))
        return false;
    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2)
            pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1)))
        return false;
    return true;
}
/**
 * Formata CNPJ para o padrão 00.000.000/0000-00
 */
function formatarCNPJ(cnpj) {
    const clean = cnpj.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
