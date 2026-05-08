/**
 * Formata CPF: 000.000.000-00
 */
export const formatarCPF = (value: string) => {
    const clean = value.replace(/\D/g, '');
    return clean
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        .substring(0, 14);
};

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export const formatarCNPJ = (value: string) => {
    const clean = value.replace(/\D/g, '');
    return clean
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        .substring(0, 18);
};

/**
 * Formata Moeda: R$ 0,00
 */
export const formatarMoeda = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

/**
 * Formata Data: DD/MM/AAAA
 */
export const formatarData = (value: string | Date) => {
    return new Date(value).toLocaleDateString('pt-BR');
};
