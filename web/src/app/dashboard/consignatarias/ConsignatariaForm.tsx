"use client";

import React, { useState, useEffect } from "react";
import { Consignataria } from "../../../types/entidades";
import {
  Button,
  FormField,
  Input,
  Select,
} from "../../../design-system/components";
import styles from "./consignatarias.module.css";

interface ConsignatariaFormProps {
  item?: Consignataria | null;
  onSave: (data: Partial<Consignataria>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function ConsignatariaForm({
  item,
  onSave,
  onCancel,
  loading,
}: ConsignatariaFormProps) {
  const [formData, setFormData] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    tipo: "BANCO",
    cet_maximo: "",
    status: "ATIVA",
    contato_email: "",
    contato_telefone: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        cnpj: item.cnpj,
        razao_social: item.razao_social,
        nome_fantasia: item.nome_fantasia || "",
        tipo: item.tipo,
        cet_maximo: item.cet_maximo?.toString() || "",
        status: item.status,
        contato_email: item.contato_email || "",
        contato_telefone: item.contato_telefone || "",
      });
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 14) {
      setFormData((prev) => ({ ...prev, cnpj: value }));
    }
  };

  const formatCnpjDisplay = (cnpj: string) => {
    return cnpj
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
      .substring(0, 18);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tipo: formData.tipo as any,
      status: formData.status as any,
      cet_maximo: formData.cet_maximo
        ? parseFloat(formData.cet_maximo)
        : undefined,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{item ? "Editar Consignatária" : "Nova Consignatária"}</h2>
          <button onClick={onCancel} className={styles.closeBtn}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.formGroup} ${styles.formFull}`}>
            <FormField label="Razão Social">
              <Input
                name="razao_social"
                value={formData.razao_social}
                onChange={handleChange}
                required
                placeholder="Nome jurídico da instituição"
              />
            </FormField>
          </div>

          <div className={`${styles.formGroup} ${styles.formFull}`}>
            <FormField label="Nome Fantasia">
              <Input
                name="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={handleChange}
                placeholder="Nome comercial"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="CNPJ">
              <Input
                name="cnpj"
                value={formatCnpjDisplay(formData.cnpj)}
                onChange={handleCnpjChange}
                required
                placeholder="00.000.000/0000-00"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Tipo de Instituição">
              <Select name="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="BANCO">Banco</option>
                <option value="SEGURADORA">Seguradora</option>
                <option value="PLANO_SAUDE">Plano de Saúde</option>
                <option value="ASSOCIACAO">Associação</option>
                <option value="OUTROS">Outros</option>
              </Select>
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="CET Máximo (%)">
              <Input
                type="number"
                step="0.0001"
                name="cet_maximo"
                value={formData.cet_maximo}
                onChange={handleChange}
                placeholder="Ex: 0.05 (5%)"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Status">
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ATIVO">Ativa</option>
                <option value="SUSPENSO">Suspensa</option>
                <option value="INATIVO">Inativa</option>
              </Select>
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="E-mail de Contato">
              <Input
                type="email"
                name="contato_email"
                value={formData.contato_email}
                onChange={handleChange}
                placeholder="banco@contato.com.br"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Telefone">
              <Input
                name="contato_telefone"
                value={formData.contato_telefone}
                onChange={handleChange}
                placeholder="(22) 99999-9999"
              />
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
              {item ? "Atualizar" : "Cadastrar Instituição"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
