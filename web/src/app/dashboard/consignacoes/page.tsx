"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  listarConsignacoes,
  buscarConsignacao,
  criarConsignacao,
  aprovarConsignacao,
  ativarConsignacao,
  cancelarConsignacao,
  quitarConsignacao,
  portarConsignacao,
  Consignacao,
  PaginatedConsignacoes,
  Parcela,
  listarParcelas,
} from "../../../services/consignacoes";
import { Badge, Button } from "../../../design-system/components";
import { useNotificationHelpers } from "../../../services/notification";
import styles from "./consignacoes.module.css";

const statusColors: Record<
  string,
  "success" | "warning" | "danger" | "neutral"
> = {
  SOLICITADA: "neutral",
  APROVADA: "warning",
  ATIVA: "success",
  QUITADA: "success",
  CANCELADA: "danger",
  PORTADA: "warning",
};

export default function ConsignacoesPage() {
  const notify = useNotificationHelpers();
  const [items, setItems] = useState<Consignacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Consignacao | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarConsignacoes(page, 10, {
        status: statusFilter || undefined,
      });
      setItems(data.data);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Erro ao carregar consignações:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  async function handleViewDetail(item: Consignacao) {
    try {
      const full = await buscarConsignacao(item.id);
      setSelectedItem(full);
      const parcelasData = await listarParcelas(item.id);
      setParcelas(parcelasData.data);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    }
  }

  async function handleAction(action: string) {
    if (!selectedItem) return;
    try {
      let result: Consignacao;
      switch (action) {
        case "aprovar":
          result = await aprovarConsignacao(selectedItem.id);
          break;
        case "ativar":
          result = await ativarConsignacao(selectedItem.id);
          break;
        case "cancelar":
          result = await cancelarConsignacao(selectedItem.id);
          break;
        case "quitar":
          result = await quitarConsignacao(selectedItem.id);
          break;
        default:
          return;
      }
      setSelectedItem(result);
      await fetchItems();
      notify.success("Ação executada com sucesso");
    } catch (error: any) {
      notify.error(error.message || "Erro ao executar ação");
    }
  }

  function canAprovar() {
    return selectedItem?.status_fluxo === "SOLICITADA";
  }

  function canAtivar() {
    return selectedItem?.status_fluxo === "APROVADA";
  }

  function canCancelar() {
    return ["SOLICITADA", "APROVADA"].includes(
      selectedItem?.status_fluxo || "",
    );
  }

  function canQuitar() {
    return selectedItem?.status_fluxo === "ATIVA";
  }

  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Consignações</h1>
        <p className={styles.subtitle}>
          Gerenciamento de consignações em folha de pagamento.
        </p>
      </div>

      <div className={styles.filters}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">Todos os Status</option>
          <option value="SOLICITADA">Solicitada</option>
          <option value="APROVADA">Aprovada</option>
          <option value="ATIVA">Ativa</option>
          <option value="QUITADA">Quitada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.skeleton}>Carregando consignações...</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Servidor</th>
                  <th>Instituição</th>
                  <th>Valor Total</th>
                  <th>Taxa/CET</th>
                  <th>Parcelas</th>
                  <th>Status</th>
                  <th className={styles.centerCell}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.fontBold}>
                        {item.servidor?.nome || "—"}
                      </div>
                      <div className={styles.metaText}>
                        {item.servidor?.cpf || "—"}
                      </div>
                    </td>
                    <td>{item.consignataria?.razao_social || "—"}</td>
                    <td className={styles.monospace}>
                      R$ {item.valor_total.toFixed(2)}
                    </td>
                    <td className={styles.monospace}>
                      {item.taxa_juros.toFixed(2)}% /{" "}
                      {item.cet_percentual.toFixed(2)}%
                    </td>
                    <td className={styles.centered}>
                      {item.quantidade_parcelas}x R${" "}
                      {item.valor_parcela.toFixed(2)}
                    </td>
                    <td>
                      <Badge
                        tone={statusColors[item.status_fluxo] || "neutral"}
                      >
                        {item.status_fluxo}
                      </Badge>
                    </td>
                    <td className={styles.actionsCell}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className={styles.emptyState}>
                Nenhuma consignação encontrada.
              </div>
            )}

            <div className={styles.pagination}>
              <Button
                variant="ghost"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </Button>
              <span className={styles.pageInfo}>
                Página {page} de {Math.ceil(total / 10)} ({total} total)
              </span>
              <Button
                variant="ghost"
                disabled={page >= Math.ceil(total / 10)}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima →
              </Button>
            </div>
          </>
        )}
      </div>

      {isDetailOpen && selectedItem && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Detalhes da Consignação</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsDetailOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Status:</span>
                  <Badge
                    tone={statusColors[selectedItem.status_fluxo] || "neutral"}
                  >
                    {selectedItem.status_fluxo}
                  </Badge>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Servidor:</span>
                  <span>{selectedItem.servidor?.nome}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Instituição:</span>
                  <span>{selectedItem.consignataria?.razao_social}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Produto:</span>
                  <span>{selectedItem.produto?.nome}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Valor Total:</span>
                  <span className={styles.monospace}>
                    R$ {selectedItem.valor_total.toFixed(2)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Taxa/CET:</span>
                  <span className={styles.monospace}>
                    {selectedItem.taxa_juros.toFixed(2)}% /{" "}
                    {selectedItem.cet_percentual.toFixed(2)}%
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Parcelas:</span>
                  <span>
                    {selectedItem.quantidade_parcelas}x R${" "}
                    {selectedItem.valor_parcela.toFixed(2)}
                  </span>
                </div>
              </div>

              {parcelas.length > 0 && (
                <div className={styles.parcelasSection}>
                  <h3>Parcelas ({parcelas.length})</h3>
                  <table className={styles.parcelasTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Valor</th>
                        <th>Competência</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parcelas.map((p) => (
                        <tr key={p.id}>
                          <td className={styles.centered}>
                            {p.numero_parcela}
                          </td>
                          <td className={styles.monospace}>
                            R$ {p.valor.toFixed(2)}
                          </td>
                          <td>{p.competencia}</td>
                          <td>
                            <Badge
                              tone={p.status === "PAGA" ? "success" : "neutral"}
                            >
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {canAprovar() && (
                <Button
                  onClick={() => handleAction("aprovar")}
                  variant="primary"
                >
                  Aprovar
                </Button>
              )}
              {canAtivar() && (
                <Button
                  onClick={() => handleAction("ativar")}
                  variant="primary"
                >
                  Ativar
                </Button>
              )}
              {canQuitar() && (
                <Button
                  onClick={() => handleAction("quitar")}
                  variant="primary"
                >
                  Quitar
                </Button>
              )}
              {canCancelar() && (
                <Button
                  onClick={() => handleAction("cancelar")}
                  variant="danger"
                >
                  Cancelar
                </Button>
              )}
              <Button onClick={() => setIsDetailOpen(false)} variant="ghost">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
