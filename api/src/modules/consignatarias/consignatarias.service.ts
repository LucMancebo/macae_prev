import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { validarCNPJ } from '../../utils/validators';

export class ConsignatariasService {
    async listar(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ConsignatariaWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { razao_social: { contains: search, mode: 'insensitive' } },
                        { nome_fantasia: { contains: search, mode: 'insensitive' } },
                        { cnpj: { contains: search } }
                    ]
                } : {},
                status ? { status } : {}
            ]
        };

        const [total, items] = await Promise.all([
            prisma.consignataria.count({ where }),
            prisma.consignataria.findMany({
                where,
                skip,
                take: limit,
                orderBy: { razao_social: 'asc' }
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

    async buscarPorId(id: string) {
        const item = await prisma.consignataria.findUnique({
            where: { id },
            include: {
                produtos: true,
                _count: { select: { contratos: true, usuarios: true } }
            }
        });

        if (!item) throw new Error('Consignatária não encontrada');
        return item;
    }

    async criar(data: Prisma.ConsignatariaCreateInput) {
        if (!validarCNPJ(data.cnpj)) {
            throw new Error('CNPJ matematicamente inválido');
        }

        const exists = await prisma.consignataria.findUnique({ where: { cnpj: data.cnpj } });
        if (exists) throw new Error('CNPJ já cadastrado no sistema');

        return prisma.consignataria.create({ data });
    }

    async atualizar(id: string, data: Prisma.ConsignatariaUpdateInput) {
        const item = await prisma.consignataria.findUnique({ where: { id } });
        if (!item) throw new Error('Consignatária não encontrada');

        if (data.cnpj && data.cnpj !== item.cnpj) {
            if (!validarCNPJ(data.cnpj as string)) {
                throw new Error('Novo CNPJ matematicamente inválido');
            }
            const exists = await prisma.consignataria.findUnique({ where: { cnpj: data.cnpj as string } });
            if (exists) throw new Error('Este CNPJ já pertence a outra instituição');
        }

        return prisma.consignataria.update({
            where: { id },
            data
        });
    }

    async excluir(id: string) {
        const item = await prisma.consignataria.findUnique({
            where: { id },
            include: { _count: { select: { contratos: true } } }
        });

        if (!item) throw new Error('Consignatária não encontrada');
        
        if (item._count.contratos > 0) {
            throw new Error('Não é possível excluir uma consignatária com contratos ativos');
        }

        return prisma.consignataria.delete({ where: { id } });
    }
}
