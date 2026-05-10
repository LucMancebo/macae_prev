import { CalculosService } from '../calculos';

describe('CalculosService — Unit Tests', () => {
    describe('calcularCET', () => {
        it('should calculate CET for 1.5% monthly rate', () => {
            // 1.5% ao mês = 19.56% ao ano (aprox)
            const cet = CalculosService.calcularCET(1.5, 0);
            expect(cet).toBeCloseTo(19.56, 1);
        });

        it('should calculate CET with additional costs', () => {
            // 1.5% taxa + 0.5% custos = 2% efetiva ao mês
            const cet = CalculosService.calcularCET(1.5, 0.5);
            expect(cet).toBeGreaterThan(19.56);
            expect(cet).toBeLessThan(27);
        });

        it('should calculate CET for 0% rate (no interest)', () => {
            const cet = CalculosService.calcularCET(0, 0);
            expect(cet).toBe(0);
        });

        it('should throw error for negative rate', () => {
            expect(() => CalculosService.calcularCET(-1, 0)).toThrow();
        });

        it('should return value with 2 decimal places', () => {
            const cet = CalculosService.calcularCET(1.5, 0);
            const decimals = (cet.toString().split('.')[1] || '').length;
            expect(decimals).toBeLessThanOrEqual(2);
        });

        it('should calculate CET for maximum allowed rate (30%)', () => {
            const cet = CalculosService.calcularCET(30, 0);
            expect(cet).toBeGreaterThan(300); // Much higher annualized
        });
    });

    describe('calcularParcelas', () => {
        it('should calculate monthly payment for R$ 10,000 at 1.5% for 60 months', () => {
            const resultado = CalculosService.calcularParcelas(10000, 1.5, 60);

            expect(resultado.valor_parcela).toBeGreaterThan(0);
            expect(resultado.valor_total).toBeGreaterThan(10000);
            expect(resultado.juros_total).toBeGreaterThan(0);

            // Validações básicas: juros deve ser = total - principal
            const jurosByCalculation = resultado.valor_total - 10000;
            expect(Math.abs(resultado.juros_total - jurosByCalculation)).toBeLessThan(0.01);
        });

        it('should calculate parcelas at 0% interest (no fees)', () => {
            const resultado = CalculosService.calcularParcelas(10000, 0, 60);

            expect(resultado.valor_parcela).toBe(166.67);
            expect(resultado.valor_total).toBe(10000);
            expect(resultado.juros_total).toBe(0);
        });

        it('should calculate for single payment (1 month)', () => {
            const resultado = CalculosService.calcularParcelas(10000, 1.5, 1);

            // Valor da parcela única
            expect(resultado.valor_parcela).toBe(10150);
            expect(resultado.valor_total).toBe(10150);
            expect(resultado.juros_total).toBe(150);
        });

        it('should throw error for invalid principal', () => {
            expect(() => CalculosService.calcularParcelas(0, 1.5, 60)).toThrow();
            expect(() => CalculosService.calcularParcelas(-5000, 1.5, 60)).toThrow();
        });

        it('should throw error for invalid quantity', () => {
            expect(() => CalculosService.calcularParcelas(10000, 1.5, 0)).toThrow();
            expect(() => CalculosService.calcularParcelas(10000, 1.5, 60.5)).toThrow();
        });

        it('should return values with 2 decimal places', () => {
            const resultado = CalculosService.calcularParcelas(10000, 1.5, 60);

            const decimaisVP = (resultado.valor_parcela.toString().split('.')[1] || '').length;
            const decimaisVT = (resultado.valor_total.toString().split('.')[1] || '').length;
            const decimaisJT = (resultado.juros_total.toString().split('.')[1] || '').length;

            expect(decimaisVP).toBeLessThanOrEqual(2);
            expect(decimaisVT).toBeLessThanOrEqual(2);
            expect(decimaisJT).toBeLessThanOrEqual(2);
        });

        it('should calculate different scenarios correctly', () => {
            // Cenário 1: R$ 5,000 a 2% ao mês em 36 parcelas
            const cenario1 = CalculosService.calcularParcelas(5000, 2, 36);
            expect(cenario1.valor_parcela).toBeGreaterThan(0);
            expect(cenario1.juros_total).toBeGreaterThan(0);

            // Cenário 2: R$ 15,000 a 1% ao mês em 120 parcelas
            const cenario2 = CalculosService.calcularParcelas(15000, 1, 120);
            expect(cenario2.valor_parcela).toBeGreaterThan(0);
            expect(cenario2.valor_total).toBeGreaterThan(15000);
        });
    });

    describe('calcularDisponibilidadeMaragem', () => {
        it('should calculate available margem (limit 5000, used 1500)', () => {
            const resultado = CalculosService.calcularDisponibilidadeMaragem(5000, 1500);

            expect(resultado.valor_limite).toBe(5000);
            expect(resultado.valor_utilizado).toBe(1500);
            expect(resultado.valor_disponivel).toBe(3500);
        });

        it('should calculate when no margem is used', () => {
            const resultado = CalculosService.calcularDisponibilidadeMaragem(5000, 0);

            expect(resultado.valor_limite).toBe(5000);
            expect(resultado.valor_utilizado).toBe(0);
            expect(resultado.valor_disponivel).toBe(5000);
        });

        it('should calculate when margem is fully used', () => {
            const resultado = CalculosService.calcularDisponibilidadeMaragem(5000, 5000);

            expect(resultado.valor_limite).toBe(5000);
            expect(resultado.valor_utilizado).toBe(5000);
            expect(resultado.valor_disponivel).toBe(0);
        });

        it('should throw error when used > limit', () => {
            expect(() => CalculosService.calcularDisponibilidadeMaragem(5000, 5500)).toThrow();
        });

        it('should throw error for negative values', () => {
            expect(() => CalculosService.calcularDisponibilidadeMaragem(-5000, 1500)).toThrow();
            expect(() => CalculosService.calcularDisponibilidadeMaragem(5000, -1500)).toThrow();
        });

        it('should return values with 2 decimal places', () => {
            const resultado = CalculosService.calcularDisponibilidadeMaragem(5000.123, 1500.456);

            expect(resultado.valor_limite).toBeCloseTo(5000.12, 2);
            expect(resultado.valor_utilizado).toBeCloseTo(1500.46, 2);
            expect(resultado.valor_disponivel).toBeCloseTo(3499.67, 2);
        });
    });

    describe('calcularPercentualUtilizacao', () => {
        it('should calculate 50% utilization (2500/5000)', () => {
            const percentual = CalculosService.calcularPercentualUtilizacao(5000, 2500);
            expect(percentual).toBe(50);
        });

        it('should calculate 0% utilization (0/5000)', () => {
            const percentual = CalculosService.calcularPercentualUtilizacao(5000, 0);
            expect(percentual).toBe(0);
        });

        it('should calculate 100% utilization (5000/5000)', () => {
            const percentual = CalculosService.calcularPercentualUtilizacao(5000, 5000);
            expect(percentual).toBe(100);
        });

        it('should cap at 100% when used > limit', () => {
            const percentual = CalculosService.calcularPercentualUtilizacao(5000, 5500);
            expect(percentual).toBe(100);
        });

        it('should return 0% for zero limit', () => {
            const percentual = CalculosService.calcularPercentualUtilizacao(0, 0);
            expect(percentual).toBe(0);
        });

        it('should throw error for negative used', () => {
            expect(() => CalculosService.calcularPercentualUtilizacao(5000, -100)).toThrow();
        });

        it('should return values with 2 decimal places', () => {
            const percentual = CalculosService.calcularPercentualUtilizacao(1000, 333.33);
            expect(percentual).toBeLessThanOrEqual(100);
            const decimals = (percentual.toString().split('.')[1] || '').length;
            expect(decimals).toBeLessThanOrEqual(2);
        });

        it('should calculate various percentages correctly', () => {
            expect(CalculosService.calcularPercentualUtilizacao(10000, 1000)).toBe(10);
            expect(CalculosService.calcularPercentualUtilizacao(10000, 2500)).toBe(25);
            expect(CalculosService.calcularPercentualUtilizacao(10000, 7500)).toBe(75);
            expect(CalculosService.calcularPercentualUtilizacao(10000, 9999)).toBeCloseTo(100, 1);
        });
    });
});
