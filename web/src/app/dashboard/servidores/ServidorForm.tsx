"use client";

import React, { useState, useEffect } from "react";
import { Servidor } from "../../../types/entidades";
import {
  Button,
  FormField,
  Input,
  Select,
} from "../../../design-system/components";
import styles from "./servidores.module.css";

interface ServidorFormProps {
  servidor?: Servidor | null;
  onSave: (data: Partial<Servidor>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function ServidorForm({
  servidor,
  onSave,
  onCancel,
  loading,
}: ServidorFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    matricula: "",
    cargo: "",
    situacao_funcional: "ATIVO",
    data_admissao: "",
    remuneracao_bruta: "",
    status: "ATIVO",
  });

  useEffect(() => {
    if (servidor) {
      setFormData({
        ...servidor,
        data_admissao: servidor.data_admissao
          ? new Date(servidor.data_admissao).toISOString().split("T")[0]
          : "",
        remuneracao_bruta: servidor.remuneracao_bruta?.toString() || "",
      });
    }
  }, [servidor]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Máscara simples de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setFormData((prev) => ({ ...prev, cpf: value }));
    }
  };

  const formatCpfDisplay = (cpf: string) => {
    return cpf
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      .substring(0, 14);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      situacao_funcional: formData.situacao_funcional as any,
      status: formData.status as any,
      remuneracao_bruta: parseFloat(formData.remuneracao_bruta),
      data_admissao: new Date(formData.data_admissao).toISOString(),
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{servidor ? "Editar Servidor" : "Novo Servidor"}</h2>
          <button onClick={onCancel} className={styles.closeBtn}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.formGroup} ${styles.formFull}`}>
            <FormField label="Nome Completo">
              <Input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: João da Silva"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="CPF">
              <Input
                name="cpf"
                value={formatCpfDisplay(formData.cpf)}
                onChange={handleCpfChange}
                required
                placeholder="000.000.000-00"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Matrícula">
              <Input
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                required
                placeholder="M-12345"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Cargo">
              <Input
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
                placeholder="Ex: Analista Previdenciário"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Situação Funcional">
              <Select
                name="situacao_funcional"
                value={formData.situacao_funcional}
                onChange={handleChange}
              >
                <option value="ATIVO">Ativo</option>
                <option value="APOSENTADO">Aposentado</option>
                <option value="PENSIONISTA">Pensionista</option>
              </Select>
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Data Admissão">
              <Input
                type="date"
                name="data_admissao"
                value={formData.data_admissao}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Remuneração Bruta (R$)">
              <Input
                type="number"
                step="0.01"
                name="remuneracao_bruta"
                value={formData.remuneracao_bruta}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Status no Sistema">
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </Select>
            </FormField>
          </div>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {servidor ? "Atualizar" : "Cadastrar Servidor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
