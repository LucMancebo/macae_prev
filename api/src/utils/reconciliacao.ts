import { prisma } from '../config/database';
import { LinhaFolhaEntrada, ResultadoReconciliacao } from '../types/arquivo';

function numeroParaFloat(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value.replace(',', '.')) || 0;
    if (value === null || value === undefined) return 0;
    return 0;
}

export async function reconciliarParcelas(linhas: LinhaFolhaEntrada[], arquivoIntegracaoId: string): Promise<ResultadoReconciliacao> {
    const inicio = Date.now();

    const resultado: ResultadoReconciliacao = {
        arquivo_id: arquivoIntegracaoId,
        total_parcelas: linhas.length,
        conciliadas: 0,
        pendentes: 0,
        erros: 0,
        taxa_conciliacao: 0,
        detalhes_por_status: {
            CONCILIADA: 0,
            PENDENTE: 0,
            ERRO_FK: 0,
            ERRO_VALOR: 0,
            ERRO_ARQUIVO: 0
        },
        detalhes_por_motivo: {},
        data_inicio_processamento: new Date(inicio),
        data_fim_processamento: new Date(inicio),
        tempo_processamento_ms: 0
    };

    for (const linha of linhas) {
        if (linha.status !== 'VALIDA') {
            resultado.erros += 1;
            resultado.detalhes_por_status.ERRO_ARQUIVO += 1;
            resultado.detalhes_por_motivo['Linha inválida'] = (resultado.detalhes_por_motivo['Linha inválida'] || 0) + 1;
            continue;
        }

        const servidor = await prisma.servidor.findUnique({ where: { matricula: linha.servidor_matricula } });

        if (!servidor) {
            resultado.erros += 1;
            resultado.detalhes_por_status.ERRO_FK += 1;
            resultado.detalhes_por_motivo['Servidor não encontrado'] = (resultado.detalhes_por_motivo['Servidor não encontrado'] || 0) + 1;
            continue;
        }

        const parcela = await prisma.parcela.findFirst({
            where: {
                numero_parcela: linha.parcela_numero,
                contrato: {
                    servidor_id: servidor.id,
                    consignataria_id: linha.consignataria_id
                }
            },
            include: { contrato: true }
        });

        if (!parcela) {
            resultado.pendentes += 1;
            resultado.detalhes_por_status.PENDENTE += 1;
            resultado.detalhes_por_motivo['Parcela não encontrada'] = (resultado.detalhes_por_motivo['Parcela não encontrada'] || 0) + 1;
            continue;
        }

        const valorParcela = parseFloat(String(parcela.valor));
        const valorLinha = numeroParaFloat(linha.valor_parcela);

        const diff = Math.abs(valorParcela - valorLinha);
        const tolerancia = 0.05;

        if (diff > tolerancia) {
            resultado.erros += 1;
            resultado.detalhes_por_status.ERRO_VALOR += 1;
            resultado.detalhes_por_motivo['Valor divergente'] = (resultado.detalhes_por_motivo['Valor divergente'] || 0) + 1;

            await prisma.parcela.update({
                where: { id: parcela.id },
                data: {
                    status_reconciliacao: 'ERRO_VALOR',
                    arquivo_integracao_id: arquivoIntegracaoId
                }
            });
            continue;
        }

        await prisma.parcela.update({
            where: { id: parcela.id },
            data: {
                status_reconciliacao: 'CONCILIADA',
                arquivo_integracao_id: arquivoIntegracaoId,
                data_processamento_folha: new Date()
            }
        });

        resultado.conciliadas += 1;
        resultado.detalhes_por_status.CONCILIADA += 1;
    }

    resultado.pendentes = resultado.total_parcelas - (resultado.conciliadas + resultado.erros);
    resultado.taxa_conciliacao = resultado.total_parcelas > 0 ? (resultado.conciliadas / resultado.total_parcelas) * 100 : 0;
    resultado.data_fim_processamento = new Date();
    resultado.tempo_processamento_ms = Date.now() - inicio;

    return resultado;
}

export default reconciliarParcelas;
