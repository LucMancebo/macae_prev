"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../validators");
describe('Validators — Unit Tests', () => {
    describe('validarCPF', () => {
        it('should validate a mathematically correct CPF', () => {
            // CPF válido: 529.982.247-25
            expect((0, validators_1.validarCPF)('52998224725')).toBe(true);
        });
        it('should reject CPF with all same digits', () => {
            expect((0, validators_1.validarCPF)('11111111111')).toBe(false);
        });
        it('should reject CPF with invalid length', () => {
            expect((0, validators_1.validarCPF)('1234567890')).toBe(false);
        });
        it('should accept CPF with formatting and clean it', () => {
            expect((0, validators_1.validarCPF)('529.982.247-25')).toBe(true);
        });
        it('should reject invalid CPF', () => {
            expect((0, validators_1.validarCPF)('12345678901')).toBe(false);
        });
    });
    describe('formatarCPF', () => {
        it('should format CPF to 000.000.000-00 pattern', () => {
            expect((0, validators_1.formatarCPF)('52998224725')).toBe('529.982.247-25');
        });
        it('should handle already formatted CPF', () => {
            expect((0, validators_1.formatarCPF)('529.982.247-25')).toBe('529.982.247-25');
        });
    });
    describe('validarCNPJ', () => {
        it('should validate a mathematically correct CNPJ', () => {
            // CNPJ válido fictício para teste
            const validCNPJ = '11222333000181';
            expect((0, validators_1.validarCNPJ)(validCNPJ)).toBe(true);
        });
        it('should reject CNPJ with all same digits', () => {
            expect((0, validators_1.validarCNPJ)('11111111111111')).toBe(false);
        });
        it('should reject CNPJ with invalid length', () => {
            expect((0, validators_1.validarCNPJ)('123456789')).toBe(false);
        });
        it('should accept CNPJ with formatting', () => {
            expect((0, validators_1.validarCNPJ)('11.222.333/0001-81')).toBe(true);
        });
    });
    describe('formatarCNPJ', () => {
        it('should format CNPJ to 00.000.000/0000-00 pattern', () => {
            expect((0, validators_1.formatarCNPJ)('11222333000181')).toBe('11.222.333/0001-81');
        });
        it('should handle already formatted CNPJ', () => {
            expect((0, validators_1.formatarCNPJ)('11.222.333/0001-81')).toBe('11.222.333/0001-81');
        });
    });
    describe('validarTaxas', () => {
        it('should accept valid tax range (1.5% - 10%)', () => {
            expect((0, validators_1.validarTaxas)(1.5, 10)).toBe(true);
        });
        it('should accept minimum tax (0.5%)', () => {
            expect((0, validators_1.validarTaxas)(0.5, 5)).toBe(true);
        });
        it('should accept maximum tax (30%)', () => {
            expect((0, validators_1.validarTaxas)(1, 30)).toBe(true);
        });
        it('should reject tax below minimum (0.5%)', () => {
            expect((0, validators_1.validarTaxas)(0.3, 5)).toBe(false);
        });
        it('should reject tax above maximum (30%)', () => {
            expect((0, validators_1.validarTaxas)(1, 35)).toBe(false);
        });
        it('should reject when minimum > maximum', () => {
            expect((0, validators_1.validarTaxas)(10, 5)).toBe(false);
        });
        it('should reject negative taxes', () => {
            expect((0, validators_1.validarTaxas)(-1, 5)).toBe(false);
        });
        it('should reject non-numeric values', () => {
            expect((0, validators_1.validarTaxas)('1.5', 5)).toBe(false);
        });
        it('should reject NaN values', () => {
            expect((0, validators_1.validarTaxas)(NaN, 5)).toBe(false);
        });
    });
    describe('validarPrazo', () => {
        it('should accept valid prazo (6-240 months)', () => {
            expect((0, validators_1.validarPrazo)(60)).toBe(true);
        });
        it('should accept minimum prazo (6 months)', () => {
            expect((0, validators_1.validarPrazo)(6)).toBe(true);
        });
        it('should accept maximum prazo (240 months)', () => {
            expect((0, validators_1.validarPrazo)(240)).toBe(true);
        });
        it('should reject prazo below minimum', () => {
            expect((0, validators_1.validarPrazo)(5)).toBe(false);
        });
        it('should reject prazo above maximum', () => {
            expect((0, validators_1.validarPrazo)(241)).toBe(false);
        });
        it('should reject zero or negative prazo', () => {
            expect((0, validators_1.validarPrazo)(0)).toBe(false);
            expect((0, validators_1.validarPrazo)(-5)).toBe(false);
        });
        it('should reject non-integer prazo', () => {
            expect((0, validators_1.validarPrazo)(60.5)).toBe(false);
        });
        it('should reject non-numeric prazo', () => {
            expect((0, validators_1.validarPrazo)('60')).toBe(false);
        });
        it('should accept custom min/max range', () => {
            expect((0, validators_1.validarPrazo)(50, 24, 100)).toBe(true);
        });
        it('should reject if outside custom range', () => {
            expect((0, validators_1.validarPrazo)(150, 24, 100)).toBe(false);
        });
    });
    describe('validarMargemServidor', () => {
        it('should validate margem with positive values', () => {
            expect((0, validators_1.validarMargemServidor)(5000, 1500)).toBe(true);
        });
        it('should validate margem with zero utilizado', () => {
            expect((0, validators_1.validarMargemServidor)(5000, 0)).toBe(true);
        });
        it('should validate margem with equal limit and utilizado', () => {
            expect((0, validators_1.validarMargemServidor)(5000, 5000)).toBe(true);
        });
        it('should reject when utilizado > limite', () => {
            expect((0, validators_1.validarMargemServidor)(5000, 5500)).toBe(false);
        });
        it('should reject negative values', () => {
            expect((0, validators_1.validarMargemServidor)(-5000, 1500)).toBe(false);
            expect((0, validators_1.validarMargemServidor)(5000, -1500)).toBe(false);
        });
        it('should reject non-numeric values', () => {
            expect((0, validators_1.validarMargemServidor)('5000', 1500)).toBe(false);
        });
    });
});
