"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  listarMargens,
  buscarMargem,
  criarMargem,
  atualizarMargem,
  bloquearMargem,
  desbloquearMargem,
  deletarMargem,
  consultarDisponibilidade,
  Margem,
  PaginatedMargens,
  DisponibilidadeMaragem,
} from "../../../services/margens";
import {
  listarConsignatarias,
  Consignataria,
} from "../../../services/consignatarias";
import {
  Badge,
  Button,
  Input,
  FormField,
  Select,
} from "../../../design-system/components";
import { useNotificationHelpers } from "../../../services/notification";
import styles from "./margens.module.css";

const tiposOptions = [
  { label: "Exclusiva", value: "EXCLUSIVA" },
  { label: "Compartilhada", value: "COMPARTILHADA" },
];

export default function MargensPage() {
  const [items, setItems] = useState<Margem[]>([]);
  const [consignatarias, setConsignatarias] = useState<Consignataria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Margem | null>(null);
  const [disponibilidade, setDisponibilidade] =
    useState<DisponibilidadeMaragem | null>(null);
  const notify = useNotificationHelpers();

  const [formData, setFormData] = useState({
    consignataria_id: "",
    nome: "",
    tipo: "EXCLUSIVA",
    percentual_maximo: "",
    status: "ATIVA",
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarMargens(page, 10);
      setItems(data.data);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Erro ao carregar margens:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchConsignatarias = useCallback(async () => {
    try {
      const data = await listarConsignatarias(1, 100);
      setConsignatarias(data.items);
    } catch (error) {
      console.error("Erro ao carregar consignatárias:", error);
    }
  }, []);

  useEffect(() => {
    void fetchConsignatarias();
  }, [fetchConsignatarias]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  function handleNew() {
    setSelectedItem(null);
    setFormData({
      consignataria_id: "",
      nome: "",
      tipo: "EXCLUSIVA",
      percentual_maximo: "",
      status: "ATIVA",
    });
    setIsModalOpen(true);
  }

  async function handleEdit(item: Margem) {
    const full = await buscarMargem(item.id);
    setSelectedItem(full);
    setFormData({
      consignataria_id: full.consignataria_id,
      nome: full.nome,
      tipo: full.tipo,
      percentual_maximo: full.percentual_maximo.toString(),
      status: full.status,
    });
    setIsModalOpen(true);
  }

  async function handleViewDetail(item: Margem) {
    try {
      const disp = await consultarDisponibilidade(item.id);
      setDisponibilidade(disp);
      setSelectedItem(item);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        consignataria_id: formData.consignataria_id,
        nome: formData.nome,
        tipo: formData.tipo as "EXCLUSIVA" | "COMPARTILHADA",
        percentual_maximo: parseFloat(formData.percentual_maximo),
        status: formData.status as "ATIVA" | "INATIVA" | "BLOQUEADA",
      };

      if (selectedItem) {
        await atualizarMargem(selectedItem.id, payload as Partial<Margem>);
      } else {
        await criarMargem(
          payload as Omit<
            Margem,
            "id" | "created_at" | "updated_at" | "consignataria"
          >,
        );
      }
      setIsModalOpen(false);
      await fetchItems();
      notify.success("Margem salva com sucesso");
    } catch (error: any) {
      notify.error(error.message || "Erro ao salvar margem");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(item: Margem) {
    try {
      if (item.status === "BLOQUEADA") {
        await desbloquearMargem(item.id);
      } else {
        await bloquearMargem(item.id);
      }
      await fetchItems();
      notify.success("Status alterado com sucesso");
    } catch (error: any) {
      notify.error(error.message || "Erro ao alterar status");
    }
  }

  async function handleDelete(item: Margem) {
    if (!confirm("Tem certeza que deseja deletar esta margem?")) return;
    try {
      await deletarMargem(item.id);
      await fetchItems();
      notify.success("Margem deletada com sucesso");
    } catch (error: any) {
      notify.error(error.message || "Erro ao deletar margem");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "success";
      case "INATIVA":
        return "neutral";
      case "BLOQUEADA":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Margens de Consignação</h1>
        <p className={styles.subtitle}>
          Gerenciamento de margens para consignações.
        </p>
      </div>

      <div className={styles.actions}>
        <Button onClick={handleNew}>+ Nova Margem</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.skeleton}>Carregando margens...</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Margem</th>
                  <th>Tipo</th>
                  <th>Máximo (%)</th>
                  <th>Status</th>
                  <th className={styles.centerCell}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.fontBold}>{item.nome}</div>
                      <div className={styles.metaText}>
                        {item.consignataria?.razao_social}
                      </div>
                    </td>
                    <td>{item.tipo}</td>
                    <td className={styles.centered}>
                      {item.percentual_maximo.toFixed(2)}%
                    </td>
                    <td>
                      <Badge tone={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className={styles.actionsCell}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        📊
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(item)}
                      >
                        {item.status === "BLOQUEADA" ? "🔓" : "🔒"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className={styles.emptyState}>
                Nenhuma margem encontrada.
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

      {isDetailOpen && selectedItem && disponibilidade && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Disponibilidade de Margem</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsDetailOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Margem:</span>
                <span className={styles.fontBold}>{selectedItem.nome}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Total Alocado:</span>
                <span className={styles.monospace}>
                  R$ {disponibilidade.total_alocado.toFixed(2)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Utilizado:</span>
                <span className={styles.monospace}>
                  R$ {disponibilidade.utilizado.toFixed(2)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Disponível:</span>
                <span className={styles.monospace}>
                  R$ {disponibilidade.disponivel.toFixed(2)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Percentual Utilizado:</span>
                <span className={styles.monospace}>
                  {disponibilidade.percentual_utilizacao.toFixed(2)}%
                </span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{
                    width: `${Math.min(disponibilidade.percentual_utilizacao, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button onClick={() => setIsDetailOpen(false)} variant="ghost">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{selectedItem ? "Editar Margem" : "Nova Margem"}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <FormField label="Instituição *">
                <Select
                  value={formData.consignataria_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consignataria_id: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione...</option>
                  {consignatarias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razao_social}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Nome da Margem *">
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Margem Exclusiva Banco ABC"
                />
              </FormField>

              <FormField label="Tipo *">
                <Select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                >
                  {tiposOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Percentual Máximo (%) *">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.percentual_maximo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentual_maximo: e.target.value,
                    })
                  }
                  placeholder="Ex: 50"
                />
              </FormField>

              <FormField label="Status *">
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="ATIVA">Ativa</option>
                  <option value="INATIVA">Inativa</option>
                  <option value="BLOQUEADA">Bloqueada</option>
                </Select>
              </FormField>
            </div>

            <div className={styles.modalFooter}>
              <Button onClick={handleSave} variant="primary" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
