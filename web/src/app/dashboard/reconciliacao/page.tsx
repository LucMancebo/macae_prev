'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, Button } from '@/design-system/components';
import { buscarRelatorioReconciliacao, RelatorioReconciliacao, FiltrosRelatorio } from '@/services/reconciliacao';
import styles from './reconciliacao.module.css';

export default function ReconciliacaoPage() {
    const [relatorio, setRelatorio] = useState<RelatorioReconciliacao | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<FiltrosRelatorio>({});

    const carregarRelatorio = async () => {
        try {
            setLoading(true);
            setError(null);
            const dados = await buscarRelatorioReconciliacao(filtros);
            setRelatorio(dados);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar relatório');
            console.error('Erro ao carregar relatório:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarRelatorio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusBadgeClass = (status: string) => {
        if (status.includes('CONCILIADA')) return styles.statusConciliada;
        if (status.includes('ERRO')) return styles.statusErro;
        if (status.includes('PENDENTE')) return styles.statusPendente;
        return '';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            CONCILIADA: 'Conciliada',
            ERRO_FK: 'Erro - FK',
            ERRO_VALOR: 'Erro - Valor',
            ERRO_ARQUIVO: 'Erro - Arquivo',
            PENDENTE: 'Pendente',
        };
        return labels[status] || status;
    };

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Reconciliação de Folha</h1>
                <p className={styles.heroDescription}>
                    Acompanhe o status de reconciliação das parcelas processadas a partir dos arquivos de folha de pagamento importados.
                </p>
            </div>

            {/* Filtros Section */}
            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Data Início</label>
                    <input
                        type="date"
                        className={styles.filterInput}
                        value={filtros.dataInicio || ''}
                        onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value || undefined })}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Data Fim</label>
                    <input
                        type="date"
                        className={styles.filterInput}
                        value={filtros.dataFim || ''}
                        onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value || undefined })}
                    />
                </div>

                <Button onClick={carregarRelatorio} disabled={loading}>
                    {loading ? 'Carregando...' : 'Filtrar'}
                </Button>
            </div>

            {/* Results Section */}
            {error && <div className={styles.errorContainer}>{error}</div>}

            {loading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                </div>
            )}

            {!loading && relatorio && (
                <div className={styles.resultsSection}>
                    {/* Statistics Overview */}
                    <div className={styles.statisticsGrid}>
                        <div className={styles.statisticCard}>
                            <span className={styles.statisticLabel}>Total Processado</span>
                            <span className={styles.statisticValue}>{relatorio.data.total}</span>
                        </div>

                        {relatorio.data.byStatus.CONCILIADA && (
                            <div className={styles.statisticCard}>
                                <span className={styles.statisticLabel}>Conciliadas</span>
                                <span className={styles.statisticValue}>{relatorio.data.byStatus.CONCILIADA}</span>
                            </div>
                        )}

                        {Object.entries(relatorio.data.byStatus).map(([status, count]) => {
                            if (status.includes('ERRO')) {
                                return (
                                    <div key={status} className={styles.statisticCard}>
                                        <span className={styles.statisticLabel}>{getStatusLabel(status)}</span>
                                        <span className={styles.statisticValue}>{count}</span>
                                    </div>
                                );
                            }
                            return null;
                        })}

                        {relatorio.data.byStatus.PENDENTE && (
                            <div className={styles.statisticCard}>
                                <span className={styles.statisticLabel}>Pendentes</span>
                                <span className={styles.statisticValue}>{relatorio.data.byStatus.PENDENTE}</span>
                            </div>
                        )}
                    </div>

                    {/* Consignatarias Breakdown */}
                    {Object.keys(relatorio.data.byConsignataria).length > 0 && (
                        <div>
                            <h2 className={styles.heroTitle} style={{ marginBottom: '1rem' }}>
                                Detalhamento por Consignatária
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {Object.entries(relatorio.data.byConsignataria).map(([consignataria, dados]) => (
                                    <div key={consignataria} className={styles.consignatariaSection}>
                                        <h3 className={styles.consignatariaTitle}>{consignataria}</h3>
                                        <div className={styles.consignatariaStats}>
                                            <div className={styles.consignatariaStat}>
                                                <span className={styles.consignatariaStatLabel}>Total</span>
                                                <span className={styles.consignatariaStatValue}>{dados.total}</span>
                                            </div>

                                            {Object.entries(dados.byStatus).map(([status, count]) => (
                                                <div key={status} className={styles.consignatariaStat}>
                                                    <span className={styles.consignatariaStatLabel}>{getStatusLabel(status)}</span>
                                                    <div
                                                        className={`${styles.statusBadge} ${getStatusBadgeClass(status)}`}
                                                    >
                                                        {count}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {relatorio.data.total === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}>📋</div>
                            <p className={styles.emptyStateText}>Nenhum dado de reconciliação disponível</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
