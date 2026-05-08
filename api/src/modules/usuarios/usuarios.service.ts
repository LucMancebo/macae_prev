import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class UsuariosService {
    async listar(params: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const { page = 1, limit = 10, search } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.UsuarioWhereInput = search ? {
            OR: [
                { nome: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const [total, items] = await Promise.all([
            prisma.usuario.count({ where }),
            prisma.usuario.findMany({
                where,
                skip,
                take: limit,
                include: { 
                    perfil: { select: { nome: true } },
                    consignataria: { select: { razao_social: true } }
                },
                orderBy: { nome: 'asc' }
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

    async criar(data: Prisma.UsuarioCreateInput & { senha_plana: string }) {
        const { senha_plana, ...rest } = data;
        const senha_hash = await bcrypt.hash(senha_plana, 10);

        const exists = await prisma.usuario.findUnique({ where: { email: rest.email } });
        if (exists) throw new Error('E-mail já cadastrado');

        return prisma.usuario.create({
            data: {
                ...rest,
                senha_hash
            }
        });
    }

    async atualizar(id: string, data: Prisma.UsuarioUpdateInput & { senha_plana?: string }) {
        const { senha_plana, ...rest } = data;
        
        const payload: Prisma.UsuarioUpdateInput = { ...rest };
        
        if (senha_plana) {
            payload.senha_hash = await bcrypt.hash(senha_plana, 10);
        }

        return prisma.usuario.update({
            where: { id },
            data: payload
        });
    }

    async excluir(id: string) {
        // Master Admin não pode ser excluído por segurança (ID fixo no seed se necessário)
        const user = await prisma.usuario.findUnique({ where: { id } });
        if (user?.email === 'admin@macaeprev.rj.gov.br') {
            throw new Error('O Administrador Master não pode ser excluído');
        }

        return prisma.usuario.delete({ where: { id } });
    }
}
