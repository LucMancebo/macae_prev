/**
 * Tipos de paginação padronizados para todo o sistema
 */

import React from 'react';

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMeta;
}

/**
 * Helper para calcular total de páginas
 */
export function calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
}

/**
 * Hook para gerenciar estado de paginação
 */
export function usePagination(initialLimit = 10) {
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(initialLimit);
    const [total, setTotal] = React.useState(0);

    const totalPages = calculateTotalPages(total, limit);
    const isFirstPage = page === 1;
    const isLastPage = page >= totalPages;

    const goToFirstPage = () => setPage(1);
    const goToLastPage = () => setPage(totalPages);
    const nextPage = () => !isLastPage && setPage((p) => p + 1);
    const prevPage = () => !isFirstPage && setPage((p) => Math.max(1, p - 1));

    return {
        page,
        limit,
        total,
        totalPages,
        isFirstPage,
        isLastPage,
        setPage,
        setLimit,
        setTotal,
        goToFirstPage,
        goToLastPage,
        nextPage,
        prevPage,
    };
}
