import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { validarCPF } from '../../utils/validators';
import { normalizarData } from '../../utils/date-utils';

export class ServidoresService {
    async listar(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ServidorWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { nome: { contains: search, mode: 'insensitive' } },
                        { cpf: { contains: search } },
                        { matricula: { contains: search } }
                    ]
                } : {},
                status ? { status } : {}
            ]
        };

        const [total, items] = await Promise.all([
            prisma.servidor.count({ where }),
            prisma.servidor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
                include: {
                    margens_servidor: {
                        include: { margem: true }
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

    async buscarPorId(id: string) {
        const servidor = await prisma.servidor.findUnique({
            where: { id },
            include: {
                margens_servidor: {
                    include: { margem: true }
                },
                contratos: {
                    include: { 
                        consignataria: true,
                        produto: true
                    }
                }
            }
        });

        if (!servidor) throw new Error('Servidor não encontrado');
        return servidor;
    }

    async criar(data: Prisma.ServidorCreateInput) {
        // Validar formato do CPF
        if (!validarCPF(data.cpf)) {
            throw new Error('CPF matematicamente inválido');
        }

        // Validar CPF único
        const cpfExists = await prisma.servidor.findUnique({ where: { cpf: data.cpf } });
        if (cpfExists) throw new Error('CPF já cadastrado');

        // Validar Matrícula única
        const matriculaExists = await prisma.servidor.findUnique({ where: { matricula: data.matricula } });
        if (matriculaExists) throw new Error('Matrícula já cadastrada');

        // Normalizar data de admissão
        if (data.data_admissao) {
            data.data_admissao = normalizarData(data.data_admissao as string);
        }

        return prisma.servidor.create({ data });
    }

    async atualizar(id: string, data: Prisma.ServidorUpdateInput) {
        const servidor = await prisma.servidor.findUnique({ where: { id } });
        if (!servidor) throw new Error('Servidor não encontrado');

        // Se estiver alterando CPF, validar formato e unicidade
        if (data.cpf && data.cpf !== servidor.cpf) {
            if (!validarCPF(data.cpf as string)) {
                throw new Error('Novo CPF matematicamente inválido');
            }
            const cpfExists = await prisma.servidor.findUnique({ where: { cpf: data.cpf as string } });
            if (cpfExists) throw new Error('Novo CPF já cadastrado em outro registro');
        }

        // Normalizar data de admissão se enviada
        if (data.data_admissao) {
            data.data_admissao = normalizarData(data.data_admissao as string);
        }

        return prisma.servidor.update({
            where: { id },
            data
        });
    }

    async excluir(id: string) {
        const servidor = await prisma.servidor.findUnique({
            where: { id },
            include: { _count: { select: { contratos: true } } }
        });

        if (!servidor) throw new Error('Servidor não encontrado');
        
        if (servidor._count.contratos > 0) {
            throw new Error('Não é possível excluir um servidor com contratos ativos');
        }

        return prisma.servidor.delete({ where: { id } });
    }
}
