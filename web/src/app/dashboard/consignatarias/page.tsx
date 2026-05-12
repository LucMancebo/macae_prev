"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../services/api";
import { usePagination } from "../../../utils/pagination";
import { useNotificationHelpers } from "../../../services/notification";
import { Consignataria, PaginatedResponse } from "../../../types/entidades";
import { formatarCNPJ } from "../../../utils/formatters";
import ConsignatariaForm from "./ConsignatariaForm";
import AuditModal from "../servidores/AuditModal";
import { Badge, Button } from "../../../design-system/components";
import { resolveBadgeTone } from "../../../design-system/utils/status";
import styles from "./consignatarias.module.css";

export default function ConsignatariasPage() {
  const [items, setItems] = useState<Consignataria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const pagination = usePagination();
  const notify = useNotificationHelpers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Consignataria | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>(
        `/v1/consignatarias?search=${search}&page=${pagination.page}`,
      );
      setItems(data.items);
      if (data.meta) {
        pagination.setTotal(data.meta.total);
      }
    } catch (error) {
      console.error("Erro ao carregar consignatárias:", error);
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  async function handleSave(formData: Partial<Consignataria>) {
    setSaving(true);
    try {
      if (selectedItem) {
        await apiFetch(`/v1/consignatarias/${selectedItem.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/v1/consignatarias", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      setSelectedItem(null);
      notify.success("Instituição salva com sucesso");
      await fetchItems();
    } catch (error: any) {
      notify.error(error.message || "Erro ao salvar instituição");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: Consignataria) {
    setSelectedItem(item);
    setIsModalOpen(true);
  }

  function handleNew() {
    setSelectedItem(null);
    setIsModalOpen(true);
  }

  function handleViewAudit(item: Consignataria) {
    setSelectedItem(item);
    setIsAuditOpen(true);
  }

  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Instituições Consignatárias</h1>
        <p className={styles.subtitle}>
          Bancos, seguradoras e entidades parceiras do MacaePrev.
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por razão social ou CNPJ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className={styles.searchInput}
          />
        </div>
        <Button onClick={handleNew}>+ Nova Instituição</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.skeleton}>Carregando instituições...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Instituição</th>
                <th>CNPJ</th>
                <th>Tipo</th>
                <th>CET Máx</th>
                <th>Status</th>
                <th className={styles.centerCell}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.fontBold}>{item.razao_social}</div>
                    <div className={styles.metaText}>{item.nome_fantasia}</div>
                  </td>
                  <td>{formatarCNPJ(item.cnpj)}</td>
                  <td>{item.tipo}</td>
                  <td>
                    {item.cet_maximo
                      ? `${(item.cet_maximo * 100).toFixed(2)}%`
                      : "-"}
                  </td>
                  <td>
                    <Badge tone={resolveBadgeTone(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className={styles.actionsCell}>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => handleEdit(item)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => handleViewAudit(item)}
                    >
                      🔍
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly>
                      ⚙️
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.skeleton}>
                    Nenhuma instituição encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      <div className={styles.pagination}>
        <Button
          variant="ghost"
          disabled={pagination.isFirstPage}
          onClick={pagination.prevPage}
        >
          ← Anterior
        </Button>

        <span className={styles.pageInfo}>
          Página {pagination.page} de {Math.max(1, pagination.totalPages)} ({pagination.total} total)
        </span>

        <Button
          variant="ghost"
          disabled={pagination.isLastPage || pagination.totalPages === 0}
          onClick={pagination.nextPage}
        >
          Próxima →
        </Button>
      </div>

      {isModalOpen && (
        <ConsignatariaForm
          item={selectedItem}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          loading={saving}
        />
      )}

      {isAuditOpen && selectedItem && (
        <AuditModal
          entidade="Consignataria"
          id={selectedItem.id}
          onCancel={() => setIsAuditOpen(false)}
        />
      )}
    </div>
  );
}
  )}
    </div>
  );
}
