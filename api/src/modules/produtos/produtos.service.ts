import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { validarTaxas, validarPrazo } from '../../utils/validators';

export class ProdutosService {
    /**
     * Lista produtos com filtros e paginação
     */
    async listar(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        consignataria_id?: string;
        tipo?: string;
    }) {
        const { page = 1, limit = 10, search, status, consignataria_id, tipo } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ProdutoWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { nome: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                status ? { status } : {},
                consignataria_id ? { consignataria_id } : {},
                tipo ? { tipo } : {}
            ]
        };

        const [total, items] = await Promise.all([
            prisma.produto.count({ where }),
            prisma.produto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
                include: {
                    consignataria: true,
                    margem: true
                }
            })
        ]);

        return {
            items,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Busca um produto específico por ID
     */
    async buscarPorId(id: string) {
        const produto = await prisma.produto.findUnique({
            where: { id },
            include: {
                consignataria: true,
                margem: true,
                contratos: {
                    select: {
                        id: true,
                        numero_contrato: true,
                        status: true,
                        data_inicio: true
                    },
                    take: 5 // Últimos 5 contratos
                }
            }
        });

        if (!produto) throw new Error('Produto não encontrado');
        return produto;
    }

    /**
     * Cria um novo produto com validações de negócio
     */
    async criar(data: any) {
        // Validar consignatária existe
        const consignataria = await prisma.consignataria.findUnique({
            where: { id: data.consignataria_id }
        });
        if (!consignataria) {
            throw new Error('Consignatária não encontrada');
        }

        // Validar margem existe
        const margem = await prisma.margem.findUnique({
            where: { id: data.margem_id }
        });
        if (!margem) {
            throw new Error('Margem não encontrada');
        }

        // Validar tipo de produto
        const tipos_validos = ['EMPRESTIMO', 'CARTAO', 'PLANO_SAUDE', 'SEGURO', 'MENSALIDADE', 'OUTROS'];
        if (!tipos_validos.includes(data.tipo)) {
            throw new Error(`Tipo inválido. Tipos válidos: ${tipos_validos.join(', ')}`);
        }

        // Validar tipo de desconto
        const tipos_desconto_validos = ['NOMINAL', 'PERCENTUAL'];
        if (!tipos_desconto_validos.includes(data.tipo_desconto)) {
            throw new Error(`Tipo de desconto inválido. Válidos: ${tipos_desconto_validos.join(', ')}`);
        }

        // Validar taxas de juros (se fornecidas)
        if (data.juros_minimo !== null && data.juros_maximo !== null) {
            const taxa_minima = parseFloat(data.juros_minimo);
            const taxa_maxima = parseFloat(data.juros_maximo);

            if (!validarTaxas(taxa_minima, taxa_maxima)) {
                throw new Error('Taxa mínima deve ser menor ou igual à máxima (0.5% - 30% a.m.)');
            }
        }

        // Validar prazos (se fornecidos)
        if (data.prazo_minimo !== null && data.prazo_maximo !== null) {
            if (!validarPrazo(data.prazo_minimo, 6, 240) || !validarPrazo(data.prazo_maximo, 6, 240)) {
                throw new Error('Prazo deve estar entre 6 e 240 meses');
            }

            if (data.prazo_minimo > data.prazo_maximo) {
                throw new Error('Prazo mínimo não pode ser maior que prazo máximo');
            }
        }

        // Validar parcelas máximas
        if (data.parcelas_maximo !== null && data.parcelas_maximo <= 0) {
            throw new Error('Parcelas máximas deve ser positivo');
        }

        // Validar tempo de serviço mínimo
        if (data.tempo_servico_minimo !== null && data.tempo_servico_minimo < 0) {
            throw new Error('Tempo de serviço mínimo não pode ser negativo');
        }

        return prisma.produto.create({
            data: {
                nome: data.nome,
                tipo: data.tipo,
                tipo_desconto: data.tipo_desconto,
                margem_id: data.margem_id,
                consignataria_id: data.consignataria_id,
                juros_minimo: data.juros_minimo || null,
                juros_maximo: data.juros_maximo || null,
                prazo_minimo: data.prazo_minimo || null,
                prazo_maximo: data.prazo_maximo || null,
                parcelas_maximo: data.parcelas_maximo || null,
                tempo_servico_minimo: data.tempo_servico_minimo || null,
                cargos_elegiveis: data.cargos_elegiveis || null,
                status: 'ATIVO'
            },
            include: {
                consignataria: true,
                margem: true
            }
        });
    }

    /**
     * Atualiza um produto existente
     */
    async atualizar(id: string, data: any) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new Error('Produto não encontrado');

        // Validar consignatária se estiver alterando
        if (data.consignataria_id && data.consignataria_id !== produto.consignataria_id) {
            const consignataria = await prisma.consignataria.findUnique({
                where: { id: data.consignataria_id }
            });
            if (!consignataria) {
                throw new Error('Consignatária não encontrada');
            }
        }

        // Validar margem se estiver alterando
        if (data.margem_id && data.margem_id !== produto.margem_id) {
            const margem = await prisma.margem.findUnique({
                where: { id: data.margem_id }
            });
            if (!margem) {
                throw new Error('Margem não encontrada');
            }
        }

        // Validar tipo se estiver alterando
        if (data.tipo) {
            const tipos_validos = ['EMPRESTIMO', 'CARTAO', 'PLANO_SAUDE', 'SEGURO', 'MENSALIDADE', 'OUTROS'];
            if (!tipos_validos.includes(data.tipo)) {
                throw new Error(`Tipo inválido. Tipos válidos: ${tipos_validos.join(', ')}`);
            }
        }

        // Validar taxas se estiver alterando
        if (data.juros_minimo !== null || data.juros_maximo !== null) {
            const taxa_minima = parseFloat(data.juros_minimo ?? produto.juros_minimo);
            const taxa_maxima = parseFloat(data.juros_maximo ?? produto.juros_maximo);

            if (taxa_minima && taxa_maxima && !validarTaxas(taxa_minima, taxa_maxima)) {
                throw new Error('Taxa mínima deve ser menor ou igual à máxima (0.5% - 30% a.m.)');
            }
        }

        // Validar prazos se estiver alterando
        if (data.prazo_minimo !== null || data.prazo_maximo !== null) {
            const prazo_min = data.prazo_minimo ?? produto.prazo_minimo;
            const prazo_max = data.prazo_maximo ?? produto.prazo_maximo;

            if (prazo_min && prazo_max) {
                if (!validarPrazo(prazo_min, 6, 240) || !validarPrazo(prazo_max, 6, 240)) {
                    throw new Error('Prazo deve estar entre 6 e 240 meses');
                }

                if (prazo_min > prazo_max) {
                    throw new Error('Prazo mínimo não pode ser maior que prazo máximo');
                }
            }
        }

        return prisma.produto.update({
            where: { id },
            data: {
                nome: data.nome ?? produto.nome,
                tipo: data.tipo ?? produto.tipo,
                tipo_desconto: data.tipo_desconto ?? produto.tipo_desconto,
                margem_id: data.margem_id ?? produto.margem_id,
                consignataria_id: data.consignataria_id ?? produto.consignataria_id,
                juros_minimo: data.juros_minimo ?? produto.juros_minimo,
                juros_maximo: data.juros_maximo ?? produto.juros_maximo,
                prazo_minimo: data.prazo_minimo ?? produto.prazo_minimo,
                prazo_maximo: data.prazo_maximo ?? produto.prazo_maximo,
                parcelas_maximo: data.parcelas_maximo ?? produto.parcelas_maximo,
                tempo_servico_minimo: data.tempo_servico_minimo ?? produto.tempo_servico_minimo,
                cargos_elegiveis: data.cargos_elegiveis ?? produto.cargos_elegiveis,
                status: data.status ?? produto.status
            },
            include: {
                consignataria: true,
                margem: true
            }
        });
    }

    /**
     * Deleta um produto (soft delete)
     */
    async excluir(id: string) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new Error('Produto não encontrado');

        // Verificar se há contratos associados
        const contratoAssociado = await prisma.contrato.findFirst({
            where: { produto_id: id }
        });

        if (contratoAssociado) {
            throw new Error('Não é possível excluir produto com contratos associados. Altere o status para INATIVO.');
        }

        return prisma.produto.delete({ where: { id } });
    }
}
