/**
 * Validação básica para formulários - simples, sem dependências externas
 */

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    customMessage?: string;
}

export interface ValidationSchema {
    [field: string]: ValidationRule;
}

/**
 * Validador simples
 */
export class FormValidator {
    private schema: ValidationSchema;

    constructor(schema: ValidationSchema) {
        this.schema = schema;
    }

    validate(data: Record<string, any>): ValidationError[] {
        const errors: ValidationError[] = [];

        for (const [field, rules] of Object.entries(this.schema)) {
            const value = data[field];

            // Validação obrigatória
            if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
                errors.push({
                    field,
                    message: `${field} é obrigatório`,
                });
                continue;
            }

            // Se vazio e não obrigatório, pula validações de comprimento/pattern
            if (!value || (typeof value === 'string' && !value.trim())) {
                continue;
            }

            // Comprimento mínimo
            if (rules.minLength && value.length < rules.minLength) {
                errors.push({
                    field,
                    message: `${field} deve ter no mínimo ${rules.minLength} caracteres`,
                });
            }

            // Comprimento máximo
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push({
                    field,
                    message: `${field} deve ter no máximo ${rules.maxLength} caracteres`,
                });
            }

            // Pattern regex
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push({
                    field,
                    message: `${field} tem formato inválido`,
                });
            }

            // Validação customizada
            if (rules.custom && !rules.custom(value)) {
                errors.push({
                    field,
                    message: rules.customMessage || `${field} é inválido`,
                });
            }
        }

        return errors;
    }

    hasErrors(errors: ValidationError[]): boolean {
        return errors.length > 0;
    }

    getFieldError(errors: ValidationError[], field: string): string | undefined {
        return errors.find((e) => e.field === field)?.message;
    }
}

/**
 * Regras de validação comuns
 */
export const CommonRules = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required: true,
    } as ValidationRule,

    senha: {
        minLength: 8,
        required: true,
    } as ValidationRule,

    telefone: {
        pattern: /^[\d\s\-\(\)]+$/,
    } as ValidationRule,

    cpf: {
        pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    } as ValidationRule,
};

/**
 * Hook para gerenciar erros de validação
 */
import React from 'react';

export function useFormValidation(schema: ValidationSchema) {
    const [errors, setErrors] = React.useState<ValidationError[]>([]);
    const validator = React.useMemo(() => new FormValidator(schema), [schema]);

    const validate = (data: Record<string, any>) => {
        const newErrors = validator.validate(data);
        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const clearErrors = () => setErrors([]);
    const clearFieldError = (field: string) => {
        setErrors((prev) => prev.filter((e) => e.field !== field));
    };

    const getFieldError = (field: string) => {
        return validator.getFieldError(errors, field);
    };

    return {
        errors,
        validate,
        clearErrors,
        clearFieldError,
        getFieldError,
        hasErrors: validator.hasErrors(errors),
    };
}
