"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../services/api";
import { Servidor, PaginatedResponse } from "../../../types/entidades";
import { formatarCPF } from "../../../utils/formatters";
import ServidorForm from "./ServidorForm";
import AuditModal from "./AuditModal";
import { Badge, Button } from "../../../design-system/components";
import { resolveBadgeTone } from "../../../design-system/utils/status";
import styles from "./servidores.module.css";

export default function ServidoresPage() {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(
    null,
  );

  useEffect(() => {
    fetchServidores();
  }, [search, meta.page]);

  async function fetchServidores() {
    setLoading(true);
    try {
      const data = await apiFetch<PaginatedResponse<Servidor>>(
        `/v1/servidores?search=${search}&page=${meta.page}`,
      );
      setServidores(data.items);
      setMeta(data.meta);
    } catch (error) {
      console.error("Erro ao carregar servidores:", error);
    } finally {
      setLoading(false);
    }
  }

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
      fetchServidores();
    } catch (error: any) {
      alert(error.message || "Erro ao salvar servidor");
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
            onChange={(e) => setSearch(e.target.value)}
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
        <button
          disabled={meta.page === 1}
          onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
          className={styles.pageBtn}
        >
          Anterior
        </button>
        <span className={styles.pageInfo}>
          Página {meta.page} de {meta.lastPage}
        </span>
        <button
          disabled={meta.page === meta.lastPage}
          onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
          className={styles.pageBtn}
        >
          Próxima
        </button>
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
