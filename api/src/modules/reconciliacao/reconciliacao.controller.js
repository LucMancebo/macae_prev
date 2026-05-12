"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliacaoController = void 0;
const database_1 = require("../../config/database");
const error_utils_1 = require("../../utils/error-utils");
class ReconciliacaoController {
    async relatorio(request, reply) {
        try {
            const qs = request.query || {};
            const dataInicio = qs.data_inicio ? new Date(String(qs.data_inicio)) : undefined;
            const dataFim = qs.data_fim ? new Date(String(qs.data_fim)) : undefined;
            const consignatariaId = qs.consignataria_id ? String(qs.consignataria_id) : undefined;
            const where = {};
            if (dataInicio || dataFim) {
                where.data_processamento_folha = {};
                if (dataInicio)
                    where.data_processamento_folha.gte = dataInicio;
                if (dataFim)
                    where.data_processamento_folha.lte = dataFim;
            }
            if (consignatariaId) {
                where.contrato = { consignataria_id: consignatariaId };
            }
            const parcelas = await database_1.prisma.parcela.findMany({
                where,
                include: {
                    contrato: {
                        select: { consignataria_id: true }
                    }
                }
            });
            const totals = {
                total: parcelas.length,
                byStatus: {},
                byConsignataria: {}
            };
            for (const p of parcelas) {
                const st = p.status_reconciliacao || 'PENDENTE';
                totals.byStatus[st] = (totals.byStatus[st] || 0) + 1;
                const cid = p.contrato?.consignataria_id || 'UNKNOWN';
                totals.byConsignataria[cid] = totals.byConsignataria[cid] || { total: 0, byStatus: {} };
                totals.byConsignataria[cid].total += 1;
                totals.byConsignataria[cid].byStatus[st] = (totals.byConsignataria[cid].byStatus[st] || 0) + 1;
            }
            return reply.send({ ok: true, data: totals });
        }
        catch (err) {
            return (0, error_utils_1.handleReplyError)(reply, err, 'Erro ao gerar relatório');
        }
    }
}
exports.ReconciliacaoController = ReconciliacaoController;
