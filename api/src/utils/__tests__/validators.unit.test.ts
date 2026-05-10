import {
    validarCPF,
    formatarCPF,
    validarCNPJ,
    formatarCNPJ,
    validarTaxas,
    validarPrazo,
    validarMargemServidor
} from '../validators';

describe('Validators — Unit Tests', () => {
    describe('validarCPF', () => {
        it('should validate a mathematically correct CPF', () => {
            // CPF válido: 529.982.247-25
            expect(validarCPF('52998224725')).toBe(true);
        });

        it('should reject CPF with all same digits', () => {
            expect(validarCPF('11111111111')).toBe(false);
        });

        it('should reject CPF with invalid length', () => {
            expect(validarCPF('1234567890')).toBe(false);
        });

        it('should accept CPF with formatting and clean it', () => {
            expect(validarCPF('529.982.247-25')).toBe(true);
        });

        it('should reject invalid CPF', () => {
            expect(validarCPF('12345678901')).toBe(false);
        });
    });

    describe('formatarCPF', () => {
        it('should format CPF to 000.000.000-00 pattern', () => {
            expect(formatarCPF('52998224725')).toBe('529.982.247-25');
        });

        it('should handle already formatted CPF', () => {
            expect(formatarCPF('529.982.247-25')).toBe('529.982.247-25');
        });
    });

    describe('validarCNPJ', () => {
        it('should validate a mathematically correct CNPJ', () => {
            // CNPJ válido fictício para teste
            const validCNPJ = '11222333000181';
            expect(validarCNPJ(validCNPJ)).toBe(true);
        });

        it('should reject CNPJ with all same digits', () => {
            expect(validarCNPJ('11111111111111')).toBe(false);
        });

        it('should reject CNPJ with invalid length', () => {
            expect(validarCNPJ('123456789')).toBe(false);
        });

        it('should accept CNPJ with formatting', () => {
            expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
        });
    });

    describe('formatarCNPJ', () => {
        it('should format CNPJ to 00.000.000/0000-00 pattern', () => {
            expect(formatarCNPJ('11222333000181')).toBe('11.222.333/0001-81');
        });

        it('should handle already formatted CNPJ', () => {
            expect(formatarCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
        });
    });

    describe('validarTaxas', () => {
        it('should accept valid tax range (1.5% - 10%)', () => {
            expect(validarTaxas(1.5, 10)).toBe(true);
        });

        it('should accept minimum tax (0.5%)', () => {
            expect(validarTaxas(0.5, 5)).toBe(true);
        });

        it('should accept maximum tax (30%)', () => {
            expect(validarTaxas(1, 30)).toBe(true);
        });

        it('should reject tax below minimum (0.5%)', () => {
            expect(validarTaxas(0.3, 5)).toBe(false);
        });

        it('should reject tax above maximum (30%)', () => {
            expect(validarTaxas(1, 35)).toBe(false);
        });

        it('should reject when minimum > maximum', () => {
            expect(validarTaxas(10, 5)).toBe(false);
        });

        it('should reject negative taxes', () => {
            expect(validarTaxas(-1, 5)).toBe(false);
        });

        it('should reject non-numeric values', () => {
            expect(validarTaxas('1.5' as any, 5)).toBe(false);
        });

        it('should reject NaN values', () => {
            expect(validarTaxas(NaN, 5)).toBe(false);
        });
    });

    describe('validarPrazo', () => {
        it('should accept valid prazo (6-240 months)', () => {
            expect(validarPrazo(60)).toBe(true);
        });

        it('should accept minimum prazo (6 months)', () => {
            expect(validarPrazo(6)).toBe(true);
        });

        it('should accept maximum prazo (240 months)', () => {
            expect(validarPrazo(240)).toBe(true);
        });

        it('should reject prazo below minimum', () => {
            expect(validarPrazo(5)).toBe(false);
        });

        it('should reject prazo above maximum', () => {
            expect(validarPrazo(241)).toBe(false);
        });

        it('should reject zero or negative prazo', () => {
            expect(validarPrazo(0)).toBe(false);
            expect(validarPrazo(-5)).toBe(false);
        });

        it('should reject non-integer prazo', () => {
            expect(validarPrazo(60.5)).toBe(false);
        });

        it('should reject non-numeric prazo', () => {
            expect(validarPrazo('60' as any)).toBe(false);
        });

        it('should accept custom min/max range', () => {
            expect(validarPrazo(50, 24, 100)).toBe(true);
        });

        it('should reject if outside custom range', () => {
            expect(validarPrazo(150, 24, 100)).toBe(false);
        });
    });

    describe('validarMargemServidor', () => {
        it('should validate margem with positive values', () => {
            expect(validarMargemServidor(5000, 1500)).toBe(true);
        });

        it('should validate margem with zero utilizado', () => {
            expect(validarMargemServidor(5000, 0)).toBe(true);
        });

        it('should validate margem with equal limit and utilizado', () => {
            expect(validarMargemServidor(5000, 5000)).toBe(true);
        });

        it('should reject when utilizado > limite', () => {
            expect(validarMargemServidor(5000, 5500)).toBe(false);
        });

        it('should reject negative values', () => {
            expect(validarMargemServidor(-5000, 1500)).toBe(false);
            expect(validarMargemServidor(5000, -1500)).toBe(false);
        });

        it('should reject non-numeric values', () => {
            expect(validarMargemServidor('5000' as any, 1500)).toBe(false);
        });
    });
});
