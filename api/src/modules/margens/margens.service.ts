import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { CalculosService } from '../../utils/calculos';

export class MargensService {
    /**
     * Lista margens com filtros e paginação
     */
    async listar(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        tipo?: string;
        produto_id?: string;
    }) {
        const { page = 1, limit = 10, search, status, tipo, produto_id } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.MargemWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { nome: { contains: search, mode: 'insensitive' } },
                        { descricao: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                status ? { status } : {},
                tipo ? { tipo } : {},
                produto_id ? {
                    produtos: {
                        some: { id: produto_id }
                    }
                } : {}
            ]
        };

        const [total, items] = await Promise.all([
            prisma.margem.count({ where }),
            prisma.margem.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
                include: {
                    produtos: true,
                    margens_servidor: {
                        select: {
                            id: true,
                            servidor_id: true,
                            valor_total: true,
                            valor_utilizado: true,
                            valor_disponivel: true
                        }
                    }
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
     * Busca uma margem específica por ID
     */
    async buscarPorId(id: string) {
        const margem = await prisma.margem.findUnique({
            where: { id },
            include: {
                produtos: true,
                margens_servidor: {
                    include: { servidor: true }
                }
            }
        });

        if (!margem) throw new Error('Margem não encontrada');
        return margem;
    }

    /**
     * Consulta a disponibilidade de uma margem
     * Retorna o somatório de disponibilidades dos servidores
     */
    async consultarDisponibilidade(margem_id: string) {
        const margem = await this.buscarPorId(margem_id);

        const margens_servidor = await prisma.margemServidor.findMany({
            where: { margem_id },
            select: {
                valor_total: true,
                valor_utilizado: true,
                valor_disponivel: true
            }
        });

        // Somar valores
        const total_alocado = margens_servidor.reduce((sum, ms) => sum + ms.valor_total.toNumber(), 0);
        const total_utilizado = margens_servidor.reduce((sum, ms) => sum + ms.valor_utilizado.toNumber(), 0);
        const total_disponivel = margens_servidor.reduce((sum, ms) => sum + ms.valor_disponivel.toNumber(), 0);

        const percentual_utilizacao = CalculosService.calcularPercentualUtilizacao(total_alocado, total_utilizado);

        return {
            margem_id,
            margem_nome: margem.nome,
            margem_tipo: margem.tipo,
            margem_status: margem.status,
            total_alocado: parseFloat(total_alocado.toFixed(2)),
            total_utilizado: parseFloat(total_utilizado.toFixed(2)),
            total_disponivel: parseFloat(total_disponivel.toFixed(2)),
            percentual_utilizacao,
            servidores_count: margens_servidor.length
        };
    }

    /**
     * Cria uma nova margem
     */
    async criar(data: any) {
        // Validar tipo
        const tipos_validos = ['EXCLUSIVA', 'COMPARTILHADA'];
        if (!tipos_validos.includes(data.tipo)) {
            throw new Error(`Tipo inválido. Tipos válidos: ${tipos_validos.join(', ')}`);
        }

        // Validar percentual máximo (0-100%)
        const percentual = parseFloat(data.percentual_maximo);
        if (isNaN(percentual) || percentual < 0 || percentual > 100) {
            throw new Error('Percentual máximo deve ser entre 0 e 100%');
        }

        // Validar status
        const status_validos = ['ATIVA', 'INATIVA'];
        if (data.status && !status_validos.includes(data.status)) {
            throw new Error(`Status inválido. Status válidos: ${status_validos.join(', ')}`);
        }

        return prisma.margem.create({
            data: {
                nome: data.nome,
                tipo: data.tipo,
                percentual_maximo: percentual,
                descricao: data.descricao || null,
                status: data.status || 'ATIVA'
            }
        });
    }

    /**
     * Atualiza uma margem existente
     */
    async atualizar(id: string, data: any) {
        const margem = await prisma.margem.findUnique({ where: { id } });
        if (!margem) throw new Error('Margem não encontrada');

        // Validar tipo se estiver alterando
        if (data.tipo) {
            const tipos_validos = ['EXCLUSIVA', 'COMPARTILHADA'];
            if (!tipos_validos.includes(data.tipo)) {
                throw new Error(`Tipo inválido. Tipos válidos: ${tipos_validos.join(', ')}`);
            }
        }

        // Validar percentual se estiver alterando
        if (data.percentual_maximo !== undefined) {
            const percentual = parseFloat(data.percentual_maximo);
            if (isNaN(percentual) || percentual < 0 || percentual > 100) {
                throw new Error('Percentual máximo deve ser entre 0 e 100%');
            }
        }

        // Validar status se estiver alterando
        if (data.status) {
            const status_validos = ['ATIVA', 'INATIVA', 'BLOQUEADA'];
            if (!status_validos.includes(data.status)) {
                throw new Error(`Status inválido. Status válidos: ${status_validos.join(', ')}`);
            }
        }

        return prisma.margem.update({
            where: { id },
            data: {
                nome: data.nome ?? margem.nome,
                tipo: data.tipo ?? margem.tipo,
                percentual_maximo: data.percentual_maximo ?? margem.percentual_maximo,
                descricao: data.descricao ?? margem.descricao,
                status: data.status ?? margem.status
            },
            include: {
                produtos: true,
                margens_servidor: true
            }
        });
    }

    /**
     * Bloqueia uma margem (impede novas consignações)
     */
    async bloquear(id: string, motivo?: string) {
        const margem = await prisma.margem.findUnique({ where: { id } });
        if (!margem) throw new Error('Margem não encontrada');

        return prisma.margem.update({
            where: { id },
            data: {
                status: 'BLOQUEADA'
            }
        });
    }

    /**
     * Desbloqueia uma margem
     */
    async desbloquear(id: string) {
        const margem = await prisma.margem.findUnique({ where: { id } });
        if (!margem) throw new Error('Margem não encontrada');

        return prisma.margem.update({
            where: { id },
            data: {
                status: 'ATIVA'
            }
        });
    }

    /**
     * Deleta uma margem
     */
    async excluir(id: string) {
        const margem = await prisma.margem.findUnique({ where: { id } });
        if (!margem) throw new Error('Margem não encontrada');

        // Verificar se há produtos associados
        const produtoAssociado = await prisma.produto.findFirst({
            where: { margem_id: id }
        });

        if (produtoAssociado) {
            throw new Error('Não é possível excluir margem com produtos associados');
        }

        // Verificar se há margens de servidor associadas
        const margemServidorAssociada = await prisma.margemServidor.findFirst({
            where: { margem_id: id }
        });

        if (margemServidorAssociada) {
            throw new Error('Não é possível excluir margem com alocações de servidor associadas');
        }

        return prisma.margem.delete({ where: { id } });
    }
}
