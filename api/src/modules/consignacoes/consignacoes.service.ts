import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { CalculosService } from '../../utils/calculos';

interface CriarConsignacaoInput {
    servidor_id: string;
    consignataria_id: string;
    produto_id: string;
    valor_solicitado: number;
    taxa_juros: number;
    quantidade_parcelas: number;
    data_inicio?: string;
}

interface PortabilidadeInput {
    produto_id?: string;
    consignataria_id?: string;
    valor_solicitado?: number;
    taxa_juros?: number;
    quantidade_parcelas?: number;
    data_inicio?: string;
}

export class ConsignacoesService {
    async listar(params: {
        page?: number;
        limit?: number;
        status?: string;
        servidor_id?: string;
        consignataria_id?: string;
        produto_id?: string;
        tipo_operacao?: string;
    }) {
        const { page = 1, limit = 10, status, servidor_id, consignataria_id, produto_id, tipo_operacao } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ContratoWhereInput = {
            AND: [
                status ? { status } : {},
                servidor_id ? { servidor_id } : {},
                consignataria_id ? { consignataria_id } : {},
                produto_id ? { produto_id } : {},
                tipo_operacao ? { tipo_operacao } : {}
            ]
        };

        const [total, itemsRaw] = await Promise.all([
            prisma.contrato.count({ where }),
            prisma.contrato.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    servidor: true,
                    consignataria: true,
                    produto: true
                }
            })
        ]);

        const items = itemsRaw.map((item) => this.mapContratoOutput(item));

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
        const contrato = await prisma.contrato.findUnique({
            where: { id },
            include: {
                servidor: true,
                consignataria: true,
                produto: true,
                parcelas: {
                    orderBy: { numero_parcela: 'asc' }
                }
            }
        });

        if (!contrato) {
            throw new Error('Consignação não encontrada');
        }

        return this.mapContratoOutput(contrato);
    }

    async listarParcelas(id: string) {
        const contrato = await prisma.contrato.findUnique({ where: { id } });
        if (!contrato) {
            throw new Error('Consignação não encontrada');
        }

        const parcelas = await prisma.parcela.findMany({
            where: { contrato_id: id },
            orderBy: { numero_parcela: 'asc' }
        });

        return {
            consignacao_id: id,
            total: parcelas.length,
            parcelas
        };
    }

    async criar(data: CriarConsignacaoInput) {
        return this.criarContrato(data, 'NOVO');
    }

    async aprovar(id: string, aprovado_por?: string) {
        const contrato = await prisma.contrato.findUnique({ where: { id } });
        if (!contrato) {
            throw new Error('Consignação não encontrada');
        }

        if (contrato.status !== 'PENDENTE') {
            throw new Error('Apenas consignações SOLICITADAS podem ser aprovadas');
        }

        const atualizado = await prisma.contrato.update({
            where: { id },
            data: {
                data_aprovacao: new Date(),
                aprovado_por: aprovado_por || null
            },
            include: {
                servidor: true,
                consignataria: true,
                produto: true
            }
        });

        return this.mapContratoOutput(atualizado);
    }

    async ativar(id: string) {
        const contrato = await prisma.contrato.findUnique({
            where: { id },
            include: { produto: true }
        });

        if (!contrato) {
            throw new Error('Consignação não encontrada');
        }

        if (contrato.status === 'ATIVO') {
            throw new Error('Consignação já está ATIVA');
        }

        if (contrato.status === 'LIQUIDADO' || contrato.status === 'CANCELADO') {
            throw new Error('Transição de estado inválida');
        }

        if (!contrato.data_aprovacao) {
            throw new Error('Consignação precisa estar APROVADA antes de ativar');
        }

        const margemServidor = await prisma.margemServidor.findUnique({
            where: {
                servidor_id_margem_id: {
                    servidor_id: contrato.servidor_id,
                    margem_id: contrato.produto.margem_id
                }
            }
        });

        if (!margemServidor) {
            throw new Error('Margem do servidor não encontrada');
        }

        const valorParcela = Number(contrato.valor_parcela);
        const reservado = Number(margemServidor.valor_reservado);

        if (reservado < valorParcela) {
            throw new Error('Reserva de margem inconsistente para ativação');
        }

        const parcelasExistentes = await prisma.parcela.count({
            where: { contrato_id: contrato.id }
        });

        const competenciaInicial = this.formatCompetencia(contrato.data_inicio);

        const result = await prisma.$transaction(async (tx) => {
            const contratoAtivo = await tx.contrato.update({
                where: { id: contrato.id },
                data: { status: 'ATIVO' },
                include: {
                    servidor: true,
                    consignataria: true,
                    produto: true
                }
            });

            if (parcelasExistentes === 0) {
                const parcelasData: Prisma.ParcelaCreateManyInput[] = [];
                for (let i = 1; i <= contrato.quantidade_parcelas; i++) {
                    parcelasData.push({
                        contrato_id: contrato.id,
                        numero_parcela: i,
                        valor: contrato.valor_parcela,
                        competencia: this.addMonthsCompetencia(competenciaInicial, i - 1),
                        status: 'PREVISTA'
                    });
                }

                await tx.parcela.createMany({ data: parcelasData });
            }

            await tx.margemServidor.update({
                where: {
                    servidor_id_margem_id: {
                        servidor_id: contrato.servidor_id,
                        margem_id: contrato.produto.margem_id
                    }
                },
                data: {
                    valor_reservado: reservado - valorParcela,
                    valor_utilizado: Number(margemServidor.valor_utilizado) + valorParcela
                }
            });

            return contratoAtivo;
        });

        return this.mapContratoOutput(result);
    }

    async cancelar(id: string) {
        const contrato = await prisma.contrato.findUnique({
            where: { id },
            include: { produto: true }
        });

        if (!contrato) {
            throw new Error('Consignação não encontrada');
        }

        if (contrato.status === 'LIQUIDADO' || contrato.status === 'CANCELADO') {
            throw new Error('Consignação não pode ser cancelada no status atual');
        }

        const margemServidor = await prisma.margemServidor.findUnique({
            where: {
                servidor_id_margem_id: {
                    servidor_id: contrato.servidor_id,
                    margem_id: contrato.produto.margem_id
                }
            }
        });

        if (!margemServidor) {
            throw new Error('Margem do servidor não encontrada');
        }

        const valorParcela = Number(contrato.valor_parcela);

        const atualizado = await prisma.$transaction(async (tx) => {
            if (contrato.status === 'PENDENTE') {
                await tx.margemServidor.update({
                    where: {
                        servidor_id_margem_id: {
                            servidor_id: contrato.servidor_id,
                            margem_id: contrato.produto.margem_id
                        }
                    },
                    data: {
                        valor_reservado: Math.max(0, Number(margemServidor.valor_reservado) - valorParcela),
                        valor_disponivel: Number(margemServidor.valor_disponivel) + valorParcela
                    }
                });
            }

            if (contrato.status === 'ATIVO') {
                await tx.margemServidor.update({
                    where: {
                        servidor_id_margem_id: {
                            servidor_id: contrato.servidor_id,
                            margem_id: contrato.produto.margem_id
                        }
                    },
                    data: {
                        valor_utilizado: Math.max(0, Number(margemServidor.valor_utilizado) - valorParcela),
                        valor_disponivel: Number(margemServidor.valor_disponivel) + valorParcela
                    }
                });
            }

            return tx.contrato.update({
                where: { id },
                data: { status: 'CANCELADO' },
                include: {
                    servidor: true,
                    consignataria: true,
                    produto: true
                }
            });
        });

        return this.mapContratoOutput(atualizado);
    }

    async quitar(id: string) {
        const contrato = await prisma.contrato.findUnique({
            where: { id },
            include: { produto: true }
        });

        if (!contrato) {
            throw new Error('Consignação não encontrada');
        }

        if (contrato.status !== 'ATIVO') {
            throw new Error('Apenas consignações ATIVAS podem ser quitadas');
        }

        const margemServidor = await prisma.margemServidor.findUnique({
            where: {
                servidor_id_margem_id: {
                    servidor_id: contrato.servidor_id,
                    margem_id: contrato.produto.margem_id
                }
            }
        });

        if (!margemServidor) {
            throw new Error('Margem do servidor não encontrada');
        }

        const valorParcela = Number(contrato.valor_parcela);

        const atualizado = await prisma.$transaction(async (tx) => {
            await tx.margemServidor.update({
                where: {
                    servidor_id_margem_id: {
                        servidor_id: contrato.servidor_id,
                        margem_id: contrato.produto.margem_id
                    }
                },
                data: {
                    valor_utilizado: Math.max(0, Number(margemServidor.valor_utilizado) - valorParcela),
                    valor_disponivel: Number(margemServidor.valor_disponivel) + valorParcela
                }
            });

            await tx.parcela.updateMany({
                where: { contrato_id: contrato.id, status: 'PREVISTA' },
                data: { status: 'CANCELADA' }
            });

            return tx.contrato.update({
                where: { id },
                data: {
                    status: 'LIQUIDADO',
                    parcelas_pagas: contrato.quantidade_parcelas
                },
                include: {
                    servidor: true,
                    consignataria: true,
                    produto: true
                }
            });
        });

        return this.mapContratoOutput(atualizado);
    }

    async portar(contratoOrigemId: string, data: PortabilidadeInput) {
        const origem = await prisma.contrato.findUnique({
            where: { id: contratoOrigemId },
            include: { produto: true }
        });

        if (!origem) {
            throw new Error('Consignação de origem não encontrada');
        }

        if (!['ATIVO', 'LIQUIDADO'].includes(origem.status)) {
            throw new Error('Portabilidade permitida apenas para consignações ATIVAS ou QUITADAS');
        }

        const nova = await this.criarContrato(
            {
                servidor_id: origem.servidor_id,
                consignataria_id: data.consignataria_id || origem.consignataria_id,
                produto_id: data.produto_id || origem.produto_id,
                valor_solicitado: data.valor_solicitado || Number(origem.valor_total),
                taxa_juros: data.taxa_juros || Number(origem.taxa_juros),
                quantidade_parcelas: data.quantidade_parcelas || origem.quantidade_parcelas,
                data_inicio: data.data_inicio
            },
            'PORTABILIDADE',
            contratoOrigemId
        );

        return {
            ...nova,
            status_fluxo: 'PORTADA'
        };
    }

    private async criarContrato(
        data: CriarConsignacaoInput,
        tipoOperacao: 'NOVO' | 'PORTABILIDADE' | 'RENEGOCIACAO',
        contratoOrigemId?: string
    ) {
        const servidor = await prisma.servidor.findUnique({ where: { id: data.servidor_id } });
        if (!servidor) {
            throw new Error('Servidor não encontrado');
        }

        if (servidor.status !== 'ATIVO' || servidor.situacao_funcional !== 'ATIVO') {
            throw new Error('Servidor não está elegível para nova consignação');
        }

        const consignataria = await prisma.consignataria.findUnique({ where: { id: data.consignataria_id } });
        if (!consignataria) {
            throw new Error('Consignatária não encontrada');
        }

        if (consignataria.status !== 'ATIVA') {
            throw new Error('Consignatária deve estar ATIVA');
        }

        const produto = await prisma.produto.findUnique({ where: { id: data.produto_id } });
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        if (produto.status !== 'ATIVO') {
            throw new Error('Produto deve estar ATIVO');
        }

        if (produto.consignataria_id !== data.consignataria_id) {
            throw new Error('Produto não pertence à consignatária informada');
        }

        if (produto.prazo_minimo !== null && data.quantidade_parcelas < produto.prazo_minimo) {
            throw new Error(`Quantidade de parcelas menor que o prazo mínimo (${produto.prazo_minimo})`);
        }

        if (produto.prazo_maximo !== null && data.quantidade_parcelas > produto.prazo_maximo) {
            throw new Error(`Quantidade de parcelas maior que o prazo máximo (${produto.prazo_maximo})`);
        }

        if (produto.juros_minimo !== null && data.taxa_juros < Number(produto.juros_minimo)) {
            throw new Error('Taxa de juros menor que o mínimo permitido pelo produto');
        }

        if (produto.juros_maximo !== null && data.taxa_juros > Number(produto.juros_maximo)) {
            throw new Error('Taxa de juros maior que o máximo permitido pelo produto');
        }

        const margemServidor = await prisma.margemServidor.findUnique({
            where: {
                servidor_id_margem_id: {
                    servidor_id: data.servidor_id,
                    margem_id: produto.margem_id
                }
            }
        });

        if (!margemServidor) {
            throw new Error('Margem do servidor não encontrada para este produto');
        }

        const calculoParcelas = CalculosService.calcularParcelas(
            Number(data.valor_solicitado),
            Number(data.taxa_juros),
            data.quantidade_parcelas
        );

        const valorParcela = Number(calculoParcelas.valor_parcela);

        if (Number(margemServidor.valor_disponivel) < valorParcela) {
            throw new Error('Margem insuficiente para esta consignação');
        }

        const cetPercentual = CalculosService.calcularCET(Number(data.taxa_juros));
        const numeroContrato = `CTR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const dataInicio = data.data_inicio ? new Date(data.data_inicio) : new Date();
        const dataFim = this.addMonthsDate(dataInicio, data.quantidade_parcelas);

        const contrato = await prisma.$transaction(async (tx) => {
            const created = await tx.contrato.create({
                data: {
                    numero_contrato: numeroContrato,
                    servidor_id: data.servidor_id,
                    consignataria_id: data.consignataria_id,
                    produto_id: data.produto_id,
                    valor_total: Number(data.valor_solicitado),
                    valor_parcela: valorParcela,
                    quantidade_parcelas: data.quantidade_parcelas,
                    parcelas_pagas: 0,
                    taxa_juros: Number(data.taxa_juros),
                    cet: cetPercentual,
                    data_inicio: dataInicio,
                    data_fim: dataFim,
                    status: 'PENDENTE',
                    tipo_operacao: tipoOperacao,
                    contrato_origem_id: contratoOrigemId || null
                },
                include: {
                    servidor: true,
                    consignataria: true,
                    produto: true
                }
            });

            await tx.margemServidor.update({
                where: {
                    servidor_id_margem_id: {
                        servidor_id: data.servidor_id,
                        margem_id: produto.margem_id
                    }
                },
                data: {
                    valor_reservado: Number(margemServidor.valor_reservado) + valorParcela,
                    valor_disponivel: Number(margemServidor.valor_disponivel) - valorParcela
                }
            });

            return created;
        });

        return this.mapContratoOutput(contrato);
    }

    private mapContratoOutput(contrato: any) {
        return {
            ...contrato,
            status_fluxo: this.mapStatusFluxo(contrato.status, contrato.data_aprovacao, contrato.tipo_operacao)
        };
    }

    private mapStatusFluxo(status: string, dataAprovacao?: Date | null, tipoOperacao?: string): string {
        if (status === 'CANCELADO') return 'CANCELADA';
        if (status === 'LIQUIDADO') return 'QUITADA';
        if (status === 'ATIVO') return 'ATIVA';
        if (tipoOperacao === 'PORTABILIDADE') return 'PORTADA';
        if (status === 'PENDENTE' && dataAprovacao) return 'APROVADA';
        return 'SOLICITADA';
    }

    private addMonthsDate(date: Date, months: number): Date {
        const copy = new Date(date);
        copy.setMonth(copy.getMonth() + months);
        return copy;
    }

    private formatCompetencia(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    private addMonthsCompetencia(competenciaBase: string, monthsToAdd: number): string {
        const [yearStr, monthStr] = competenciaBase.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        const baseDate = new Date(year, month - 1, 1);
        baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

        const resultYear = baseDate.getFullYear();
        const resultMonth = String(baseDate.getMonth() + 1).padStart(2, '0');
        return `${resultYear}-${resultMonth}`;
    }
}
