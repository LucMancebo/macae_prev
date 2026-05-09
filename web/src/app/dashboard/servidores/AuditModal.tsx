"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../services/api";
import { AuditLog } from "../../../types/entidades";
import { formatarData } from "../../../utils/formatters";
import { Badge, Button } from "../../../design-system/components";
import { resolveBadgeTone } from "../../../design-system/utils/status";
import styles from "./servidores.module.css";

export default function AuditModal({
  entidade,
  id,
  onCancel,
}: {
  entidade: string;
  id: string;
  onCancel: () => void;
}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const data: any = await apiFetch(`/v1/audit/${entidade}/${id}`);
      setLogs(data);
    } catch (error) {
      console.error("Erro ao carregar auditoria:", error);
    } finally {
      setLoading(false);
    }
  }, [entidade, id]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.modalContentWide}`}>
        <div className={styles.modalHeader}>
          <h2>Histórico de Auditoria</h2>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onCancel}
            aria-label="Fechar auditoria"
          >
            &times;
          </Button>
        </div>

        <div className={styles.auditContainer}>
          {loading ? (
            <p className={styles.skeleton}>Carregando histórico...</p>
          ) : (
            <div className={styles.timeline}>
              {logs.map((log) => (
                <div key={log.id} className={styles.auditItem}>
                  <div className={styles.auditBadge}>
                    <Badge tone={resolveBadgeTone(log.acao)}>{log.acao}</Badge>
                  </div>
                  <div className={styles.auditDetails}>
                    <div className={styles.auditMeta}>
                      <strong>{log.usuario.nome}</strong>
                      <span>• {formatarData(log.data_hora)}</span>
                      <span>• IP: {log.ip_origem}</span>
                    </div>
                    {log.acao === "ALTERACAO" && (
                      <div className={styles.auditDiff}>
                        <p>Registro atualizado no sistema.</p>
                      </div>
                    )}
                    {log.acao === "INCLUSAO" && (
                      <p className={styles.auditInfo}>
                        Criação inicial do registro.
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className={styles.empty}>
                  Nenhum registro de auditoria encontrado.
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={onCancel}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
