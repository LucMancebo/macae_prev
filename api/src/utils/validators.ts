/**
 * Valida se um CPF é matematicamente válido
 */
export function validarCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;

    // Elimina CPFs conhecidos inválidos
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
}

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatarCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida se um CNPJ é matematicamente válido
 */
export function validarCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    const digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}

/**
 * Formata CNPJ para o padrão 00.000.000/0000-00
 */
export function formatarCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Valida intervalo de taxas de juros
 * Intervalo permitido: 0.5% a 30% ao mês
 */
export function validarTaxas(
    taxa_minima: number,
    taxa_maxima: number
): boolean {
    const TAXA_MINIMA_PERMITIDA = 0.5;
    const TAXA_MAXIMA_PERMITIDA = 30;

    // Validações básicas
    if (typeof taxa_minima !== 'number' || typeof taxa_maxima !== 'number') {
        return false;
    }

    if (isNaN(taxa_minima) || isNaN(taxa_maxima)) {
        return false;
    }

    // Não podem ser negativas
    if (taxa_minima < 0 || taxa_maxima < 0) {
        return false;
    }

    // Mínima deve ser menor ou igual à máxima
    if (taxa_minima > taxa_maxima) {
        return false;
    }

    // Devem estar dentro dos limites permitidos
    if (taxa_minima < TAXA_MINIMA_PERMITIDA || taxa_maxima > TAXA_MAXIMA_PERMITIDA) {
        return false;
    }

    return true;
}

/**
 * Valida prazo de consignação
 * Intervalo permitido: 6 a 240 meses
 */
export function validarPrazo(
    prazo: number,
    min: number = 6,
    max: number = 240
): boolean {
    // Validações básicas
    if (typeof prazo !== 'number') {
        return false;
    }

    if (isNaN(prazo)) {
        return false;
    }

    // Não pode ser negativo ou zero
    if (prazo <= 0) {
        return false;
    }

    // Deve estar dentro dos limites
    if (prazo < min || prazo > max) {
        return false;
    }

    // Deve ser inteiro
    if (!Number.isInteger(prazo)) {
        return false;
    }

    return true;
}

/**
 * Valida margem de servidor (associação entre servidor e margem de consignação)
 * Garante que a margem disponível é positiva
 */
export function validarMargemServidor(
    valor_limite: number,
    valor_utilizado: number
): boolean {
    if (typeof valor_limite !== 'number' || typeof valor_utilizado !== 'number') {
        return false;
    }

    if (isNaN(valor_limite) || isNaN(valor_utilizado)) {
        return false;
    }

    // Não podem ser negativos
    if (valor_limite < 0 || valor_utilizado < 0) {
        return false;
    }

    // Utilizado não pode ser maior que limite
    if (valor_utilizado > valor_limite) {
        return false;
    }

    return true;
}

