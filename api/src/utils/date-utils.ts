/**
 * Normaliza uma data para o meio-dia UTC para evitar problemas de fuso horário.
 * Ideal para datas de admissão, nascimento e competências.
 */
export function normalizarData(data: string | Date): Date {
    const d = new Date(data);
    // Definimos para 12:00:00 para garantir que, independente do offset, 
    // a data permaneça no mesmo dia calendário.
    d.setUTCHours(12, 0, 0, 0);
    return d;
}

/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA)
 */
export function formatarDataBR(data: Date): string {
    return data.toLocaleDateString('pt-BR');
}
