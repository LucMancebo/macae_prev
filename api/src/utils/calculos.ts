/**
 * CalculosService
 * 
 * Serviço de cálculos financeiros para consignações
 * Implementa Lei 8.078/90 (Código de Proteção ao Consumidor)
 */

export interface ParcelaInfo {
    valor_parcela: number;
    valor_total: number;
    juros_total: number;
}

export interface DisponibilidadeMargemInfo {
    valor_limite: number;
    valor_utilizado: number;
    valor_disponivel: number;
}

export class CalculosService {
    /**
     * Calcula CET (Custo Efetivo Total) conforme Lei 8.078/90
     * 
     * CET representa a taxa efetiva anual que inclui todos os custos do financiamento
     * Fórmula: CET = ([(1 + TP)^12 - 1] × 100)%
     * 
     * Onde:
     * - TP = Taxa Periódica mensal (taxa_mensal + custos_adicionais)
     * - ^12 = Elevado a 12 meses (anualização)
     * 
     * @param taxa_mensal_percentual Taxa de juros mensal em percentual (ex: 1.5 para 1.5%)
     * @param custos_adicionais_percentual Custos adicionais em percentual (ex: 0.5 para 0.5%)
     * @returns CET em percentual ao ano (ex: 19.56 para 19.56% a.a.)
     * 
     * Exemplo: taxa 1.5% a.m. = 19.56% a.a. (CET)
     */
    static calcularCET(
        taxa_mensal_percentual: number,
        custos_adicionais_percentual: number = 0,
    ): number {
        if (taxa_mensal_percentual < 0 || custos_adicionais_percentual < 0) {
            throw new Error('Taxas não podem ser negativas');
        }

        // Converte percentual para decimal
        const taxa_mensal = taxa_mensal_percentual / 100;
        const custos_adicionais = custos_adicionais_percentual / 100;

        // Taxa periódica efetiva = taxa mensal + custos adicionais
        const taxa_efetiva = taxa_mensal + custos_adicionais;

        // Fórmula CET = ([(1 + TP)^12 - 1] × 100)
        const cet_decimal = Math.pow(1 + taxa_efetiva, 12) - 1;
        const cet_percentual = cet_decimal * 100;

        // Retorna com 2 casas decimais
        return parseFloat(cet_percentual.toFixed(2));
    }

    /**
     * Calcula valor das parcelas usando o método Price (Tabela Price)
     * 
     * Fórmula: P = V × (i × (1+i)^n) / ((1+i)^n - 1)
     * 
     * Onde:
     * - P = Valor da parcela
     * - V = Valor principal (capital)
     * - i = Taxa de juros mensal (em decimal)
     * - n = Número de parcelas
     * 
     * @param valor_principal Valor do empréstimo/financiamento
     * @param taxa_mensal_percentual Taxa de juros mensal em percentual
     * @param quantidade_parcelas Número de parcelas (meses)
     * @returns Objeto com valor_parcela, valor_total e juros_total
     * 
     * Exemplo: R$ 10.000 a 1.5% a.m. em 60 parcelas
     */
    static calcularParcelas(
        valor_principal: number,
        taxa_mensal_percentual: number,
        quantidade_parcelas: number,
    ): ParcelaInfo {
        if (valor_principal <= 0) {
            throw new Error('Valor principal deve ser positivo');
        }

        if (taxa_mensal_percentual < 0) {
            throw new Error('Taxa mensal não pode ser negativa');
        }

        if (!Number.isInteger(quantidade_parcelas) || quantidade_parcelas <= 0) {
            throw new Error('Quantidade de parcelas deve ser um inteiro positivo');
        }

        // Converte taxa percentual para decimal
        const taxa = taxa_mensal_percentual / 100;

        // Caso especial: se taxa é 0, divide valor principal por número de parcelas
        if (taxa === 0) {
            const valor_parcela = valor_principal / quantidade_parcelas;
            return {
                valor_parcela: parseFloat(valor_parcela.toFixed(2)),
                valor_total: parseFloat(valor_principal.toFixed(2)),
                juros_total: 0,
            };
        }

        // Fórmula Price: P = V × (i × (1+i)^n) / ((1+i)^n - 1)
        const fator = Math.pow(1 + taxa, quantidade_parcelas);
        const numerador = taxa * fator;
        const denominador = fator - 1;
        const valor_parcela = valor_principal * (numerador / denominador);

        const valor_total = valor_parcela * quantidade_parcelas;
        const juros_total = valor_total - valor_principal;

        return {
            valor_parcela: parseFloat(valor_parcela.toFixed(2)),
            valor_total: parseFloat(valor_total.toFixed(2)),
            juros_total: parseFloat(juros_total.toFixed(2)),
        };
    }

    /**
     * Calcula disponibilidade de margem para consignação
     * 
     * Disponível = Limite - Utilizado
     * 
     * @param valor_limite Limite total de consignação disponível
     * @param valor_utilizado Valor já utilizado/comprometido
     * @returns Objeto com limite, utilizado e disponível
     * 
     * Exemplo: Limite R$ 5.000, Utilizado R$ 1.500 = Disponível R$ 3.500
     */
    static calcularDisponibilidadeMaragem(
        valor_limite: number,
        valor_utilizado: number,
    ): DisponibilidadeMargemInfo {
        if (valor_limite < 0 || valor_utilizado < 0) {
            throw new Error('Valores não podem ser negativos');
        }

        if (valor_utilizado > valor_limite) {
            throw new Error('Valor utilizado não pode exceder o limite');
        }

        const valor_disponivel = valor_limite - valor_utilizado;

        return {
            valor_limite: parseFloat(valor_limite.toFixed(2)),
            valor_utilizado: parseFloat(valor_utilizado.toFixed(2)),
            valor_disponivel: parseFloat(valor_disponivel.toFixed(2)),
        };
    }

    /**
     * Calcula percentual de utilização de margem
     * 
     * @param valor_limite Limite total
     * @param valor_utilizado Valor utilizado
     * @returns Percentual de utilização (0 a 100)
     * 
     * Exemplo: Limite R$ 5.000, Utilizado R$ 2.500 = 50% de utilização
     */
    static calcularPercentualUtilizacao(
        valor_limite: number,
        valor_utilizado: number,
    ): number {
        if (valor_limite <= 0) {
            return 0;
        }

        if (valor_utilizado < 0) {
            throw new Error('Valor utilizado não pode ser negativo');
        }

        const percentual = (valor_utilizado / valor_limite) * 100;

        // Limita entre 0 e 100 (não permite > 100%)
        return Math.min(100, parseFloat(percentual.toFixed(2)));
    }
}
