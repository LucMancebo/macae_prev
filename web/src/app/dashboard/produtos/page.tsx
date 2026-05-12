"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  Produto,
  PaginatedProdutos,
} from "../../../services/produtos";
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
import styles from "./produtos.module.css";

const tiposOptions = [
  { label: "Empréstimo", value: "EMPRESTIMO" },
  { label: "Cartão", value: "CARTAO" },
  { label: "Plano de Saúde", value: "PLANO_SAUDE" },
  { label: "Seguro", value: "SEGURO" },
  { label: "Mensalidade", value: "MENSALIDADE" },
  { label: "Outros", value: "OUTROS" },
];

const averbacaoOptions = [
  { label: "Nominal", value: "NOMINAL" },
  { label: "Percentual", value: "PERCENTUAL" },
];

export default function ProdutosPage() {
  const [items, setItems] = useState<Produto[]>([]);
  const [consignatarias, setConsignatarias] = useState<Consignataria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Produto | null>(null);
  const notify = useNotificationHelpers();

  const [formData, setFormData] = useState({
    consignataria_id: "",
    nome: "",
    tipo: "EMPRESTIMO",
    taxa_minima: "",
    taxa_maxima: "",
    averbacao: "NOMINAL",
    prazo_minimo: "",
    prazo_maximo: "",
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarProdutos(page, 10);
      setItems(data.data);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
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
      tipo: "EMPRESTIMO",
      taxa_minima: "",
      taxa_maxima: "",
      averbacao: "NOMINAL",
      prazo_minimo: "",
      prazo_maximo: "",
    });
    setIsModalOpen(true);
  }

  async function handleEdit(item: Produto) {
    const full = await buscarProduto(item.id);
    setSelectedItem(full);
    setFormData({
      consignataria_id: full.consignataria_id,
      nome: full.nome,
      tipo: full.tipo,
      taxa_minima: full.taxa_minima.toString(),
      taxa_maxima: full.taxa_maxima.toString(),
      averbacao: full.averbacao,
      prazo_minimo: full.prazo_minimo.toString(),
      prazo_maximo: full.prazo_maximo.toString(),
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        consignataria_id: formData.consignataria_id,
        nome: formData.nome,
        tipo: formData.tipo as
          | "EMPRESTIMO"
          | "CARTAO"
          | "PLANO_SAUDE"
          | "SEGURO"
          | "MENSALIDADE"
          | "OUTROS",
        taxa_minima: parseFloat(formData.taxa_minima),
        taxa_maxima: parseFloat(formData.taxa_maxima),
        averbacao: formData.averbacao as "NOMINAL" | "PERCENTUAL",
        prazo_minimo: parseInt(formData.prazo_minimo),
        prazo_maximo: parseInt(formData.prazo_maximo),
      };

      if (selectedItem) {
        await atualizarProduto(selectedItem.id, payload as Partial<Produto>);
      } else {
        await criarProduto(
          payload as Omit<
            Produto,
            "id" | "created_at" | "updated_at" | "status" | "consignataria"
          >,
        );
      }
      setIsModalOpen(false);
      await fetchItems();
      notify.success("Produto salvo com sucesso");
    } catch (error: any) {
      notify.error(error.message || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Produto) {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;
    try {
      await deletarProduto(item.id);
      await fetchItems();
      notify.success("Produto deletado com sucesso");
    } catch (error: any) {
      notify.error(error.message || "Erro ao deletar produto");
    }
  }

  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Produtos</h1>
        <p className={styles.subtitle}>
          Gerenciamento de produtos de consignação.
        </p>
      </div>

      <div className={styles.actions}>
        <Button onClick={handleNew}>+ Novo Produto</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.skeleton}>Carregando produtos...</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Taxa (%)</th>
                  <th>Prazo (meses)</th>
                  <th>Averbação</th>
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
                    <td className={styles.monospace}>
                      {item.taxa_minima.toFixed(2)}% -{" "}
                      {item.taxa_maxima.toFixed(2)}%
                    </td>
                    <td className={styles.centered}>
                      {item.prazo_minimo} - {item.prazo_maximo}
                    </td>
                    <td>{item.averbacao}</td>
                    <td>
                      <Badge
                        tone={item.status === "ATIVO" ? "success" : "danger"}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className={styles.actionsCell}>
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
                Nenhum produto encontrado.
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
              <h2>{selectedItem ? "Editar Produto" : "Novo Produto"}</h2>
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

              <FormField label="Nome do Produto *">
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Empréstimo Consignado"
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

              <div className={styles.formRow}>
                <FormField label="Taxa Mínima (%) *">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.taxa_minima}
                    onChange={(e) =>
                      setFormData({ ...formData, taxa_minima: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Taxa Máxima (%) *">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.taxa_maxima}
                    onChange={(e) =>
                      setFormData({ ...formData, taxa_maxima: e.target.value })
                    }
                  />
                </FormField>
              </div>

              <FormField label="Tipo de Averbação *">
                <Select
                  value={formData.averbacao}
                  onChange={(e) =>
                    setFormData({ ...formData, averbacao: e.target.value })
                  }
                >
                  {averbacaoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className={styles.formRow}>
                <FormField label="Prazo Mínimo (meses) *">
                  <Input
                    type="number"
                    value={formData.prazo_minimo}
                    onChange={(e) =>
                      setFormData({ ...formData, prazo_minimo: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Prazo Máximo (meses) *">
                  <Input
                    type="number"
                    value={formData.prazo_maximo}
                    onChange={(e) =>
                      setFormData({ ...formData, prazo_maximo: e.target.value })
                    }
                  />
                </FormField>
              </div>
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
