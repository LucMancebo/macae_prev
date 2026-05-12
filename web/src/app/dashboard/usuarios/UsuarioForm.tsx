"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../services/api";
import {
  Usuario,
  PerfilAcesso,
  Consignataria,
  PaginatedResponse,
} from "../../../types/entidades";
import {
  Button,
  FormField,
  Input,
  Select,
} from "../../../design-system/components";
import styles from "./usuarios.module.css";

export interface UsuarioFormData {
  nome: string;
  email: string;
  senha_plana?: string;
  perfil_id: string;
  consignataria_id?: string;
  status: string;
}

interface UsuarioFormProps {
  item?: Usuario | null;
  onSave: (data: UsuarioFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function UsuarioForm({
  item,
  onSave,
  onCancel,
  loading,
}: UsuarioFormProps) {
  const [perfis, setPerfis] = useState<PerfilAcesso[]>([]);
  const [consignatarias, setConsignatarias] = useState<Consignataria[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha_plana: "",
    perfil_id: "",
    consignataria_id: "",
    status: "ATIVO",
  });

  useEffect(() => {
    fetchAuxiliares();
    if (item) {
      setFormData({
        nome: item.nome,
        email: item.email,
        senha_plana: "", // Senha nunca vem do banco
        perfil_id: item.perfil_id,
        consignataria_id: item.consignataria_id || "",
        status: item.status,
      });
    }
  }, [item]);

  async function fetchAuxiliares() {
    try {
      const [respConsignatarias, respPerfis] = await Promise.all([
        apiFetch<PaginatedResponse<Consignataria>>("/v1/consignatarias"),
        apiFetch<PerfilAcesso[]>("/v1/auth/perfis"),
      ]);
      setConsignatarias(respConsignatarias.items || []);
      setPerfis(respPerfis || []);
    } catch (err) {
      console.error("Erro ao carregar dados auxiliares");
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UsuarioFormData = {
      nome: formData.nome,
      email: formData.email,
      perfil_id: formData.perfil_id,
      status: formData.status,
    };
    if (formData.consignataria_id) {
      payload.consignataria_id = formData.consignataria_id;
    }
    if (formData.senha_plana) {
      payload.senha_plana = formData.senha_plana;
    }
    onSave(payload);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{item ? "Editar Usuário" : "Novo Usuário"}</h2>
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
                placeholder="Nome do colaborador"
              />
            </FormField>
          </div>

          <div className={`${styles.formGroup} ${styles.formFull}`}>
            <FormField label="E-mail Institucional">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@macae.rj.gov.br"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label={`Senha ${item ? "(vazio para manter)" : ""}`}>
              <Input
                type="password"
                name="senha_plana"
                value={formData.senha_plana}
                onChange={handleChange}
                required={!item}
                placeholder="••••••••"
              />
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Perfil de Acesso">
              <Select
                name="perfil_id"
                value={formData.perfil_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um perfil...</option>
                {perfis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </Select>
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
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="INATIVO">Inativo</option>
              </Select>
            </FormField>
          </div>

          <div className={styles.formGroup}>
            <FormField label="Vincular a Consignatária">
              <Select
                name="consignataria_id"
                value={formData.consignataria_id}
                onChange={handleChange}
              >
                <option value="">Nenhuma (MacaePrev Geral)</option>
                {consignatarias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razao_social}
                  </option>
                ))}
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
              {item ? "Salvar Alterações" : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
