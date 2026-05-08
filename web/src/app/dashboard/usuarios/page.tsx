"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../services/api";
import { Usuario, PaginatedResponse } from "../../../types/entidades";
import UsuarioForm from "./UsuarioForm";
import AuditModal from "../servidores/AuditModal";
import { Badge, Button } from "../../../design-system/components";
import { resolveBadgeTone } from "../../../design-system/utils/status";
import styles from "./usuarios.module.css";

export default function UsuariosPage() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Usuario | null>(null);

  useEffect(() => {
    fetchItems();
  }, [search, meta.page]);

  async function fetchItems() {
    setLoading(true);
    try {
      const data = await apiFetch<PaginatedResponse<Usuario>>(
        `/v1/usuarios?search=${search}&page=${meta.page}`,
      );
      setItems(data.items);
      setMeta(data.meta);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(formData: any) {
    setSaving(true);
    try {
      if (selectedItem) {
        await apiFetch(`/v1/usuarios/${selectedItem.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/v1/usuarios", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (error: any) {
      alert(error.message || "Erro ao salvar usuário");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: Usuario) {
    setSelectedItem(item);
    setIsModalOpen(true);
  }

  function handleNew() {
    setSelectedItem(null);
    setIsModalOpen(true);
  }

  function handleViewAudit(item: Usuario) {
    setSelectedItem(item);
    setIsAuditOpen(true);
  }

  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Gestão de Usuários</h1>
        <p className={styles.subtitle}>
          Controle quem acessa o sistema e gerencie níveis de permissão.
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Button onClick={handleNew}>+ Novo Usuário</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.skeleton}>Carregando usuários...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Vínculo</th>
                <th>Status</th>
                <th className={styles.centerCell}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.fontBold}>{item.nome}</div>
                    <div className={styles.metaText}>{item.email}</div>
                  </td>
                  <td>{item.perfil.nome}</td>
                  <td>
                    {item.consignataria?.razao_social || "MacaePrev (Geral)"}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <UsuarioForm
          item={selectedItem}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          loading={saving}
        />
      )}

      {isAuditOpen && selectedItem && (
        <AuditModal
          entidade="Usuario"
          id={selectedItem.id}
          onCancel={() => setIsAuditOpen(false)}
        />
      )}
    </div>
  );
}
