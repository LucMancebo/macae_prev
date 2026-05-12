"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../services/api";
import { Servidor, PaginatedResponse } from "../../../types/entidades";
import { formatarCPF } from "../../../utils/formatters";
import ServidorForm from "./ServidorForm";
import AuditModal from "./AuditModal";
import { Badge, Button } from "../../../design-system/components";
import { resolveBadgeTone } from "../../../design-system/utils/status";
import { useNotificationHelpers } from "../../../services/notification";
import { useSearchParams } from "next/navigation";
import styles from "./servidores.module.css";

export default function ServidoresPage() {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const notify = useNotificationHelpers();

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(
    null,
  );

  const fetchServidores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>(
        `/v1/servidores?search=${search}&page=${page}`,
      );
      setServidores(data.items);
      if (data.meta) {
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error("Erro ao carregar servidores:", error);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const querySearch = searchParams.get("search");
    if (querySearch !== null) {
      setSearch((prev) => {
        if (prev !== querySearch) setPage(1);
        return querySearch;
      });
    }
  }, [searchParams]);

  useEffect(() => {
    void fetchServidores();
  }, [fetchServidores]);

  async function handleSave(formData: Partial<Servidor>) {
    setSaving(true);
    try {
      if (selectedServidor) {
        await apiFetch(`/v1/servidores/${selectedServidor.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/v1/servidores", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      setIsModalOpen(false);
      setSelectedServidor(null);
      await fetchServidores();
      notify.success("Servidor salvo com sucesso");
    } catch (error: any) {
      notify.error(error.message || "Erro ao salvar servidor");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(servidor: Servidor) {
    setSelectedServidor(servidor);
    setIsModalOpen(true);
  }

  function handleViewAudit(servidor: Servidor) {
    setSelectedServidor(servidor);
    setIsAuditOpen(true);
  }

  function handleNew() {
    setSelectedServidor(null);
    setIsModalOpen(true);
  }

  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Gestão de Servidores</h1>
        <p className={styles.subtitle}>
          Consulte e gerencie o cadastro de servidores municipais.
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou matrícula..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
        <Button onClick={handleNew}>+ Novo Servidor</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.skeleton}>Carregando dados...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Matrícula</th>
                <th>Cargo</th>
                <th>Status</th>
                <th className={styles.centerCell}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servidores.map((s) => (
                <tr key={s.id}>
                  <td className={styles.fontBold}>{s.nome}</td>
                  <td>{formatarCPF(s.cpf)}</td>
                  <td>{s.matricula}</td>
                  <td>{s.cargo}</td>
                  <td>
                    <Badge tone={resolveBadgeTone(s.status)}>{s.status}</Badge>
                  </td>
                  <td className={styles.actionsCell}>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      title="Editar"
                      onClick={() => handleEdit(s)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      title="Ver Histórico"
                      onClick={() => handleViewAudit(s)}
                    >
                      🔍
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly title="Detalhes">
                      📄
                    </Button>
                  </td>
                </tr>
              ))}
              {servidores.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.skeleton}>
                    Nenhum servidor encontrado.
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
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Anterior
        </Button>

        <span className={styles.pageInfo}>
          Página {page} de {Math.max(1, Math.ceil(total / 10))} ({total} total)
        </span>

        <Button
          variant="ghost"
          disabled={page >= Math.ceil(total / 10) || total === 0}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima →
        </Button>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <ServidorForm
          servidor={selectedServidor}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          loading={saving}
        />
      )}

      {/* Modal de Auditoria */}
      {isAuditOpen && selectedServidor && (
        <AuditModal
          entidade="Servidor"
          id={selectedServidor.id}
          onCancel={() => setIsAuditOpen(false)}
        />
      )}
    </div>
  );
}
