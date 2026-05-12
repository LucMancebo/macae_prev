import { apiFetch } from './api';

export interface RelatorioReconciliacao {
    ok: boolean;
    data: {
        total: number;
        byStatus: Record<string, number>;
        byConsignataria: Record<string, { total: number; byStatus: Record<string, number> }>;
    };
}

export interface FiltrosRelatorio {
    dataInicio?: string;
    dataFim?: string;
    consignatariaId?: string;
}

export async function buscarRelatorioReconciliacao(filtros: FiltrosRelatorio = {}): Promise<RelatorioReconciliacao> {
    const params = new URLSearchParams();

    if (filtros.dataInicio) {
        params.set('data_inicio', filtros.dataInicio);
    }

    if (filtros.dataFim) {
        params.set('data_fim', filtros.dataFim);
    }

    if (filtros.consignatariaId) {
        params.set('consignataria_id', filtros.consignatariaId);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/v1/reconciliacao/relatorio?${queryString}` : '/v1/reconciliacao/relatorio';

    return apiFetch<RelatorioReconciliacao>(endpoint);
}
