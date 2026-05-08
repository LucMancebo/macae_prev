"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import { Badge, Card } from "../../design-system/components";
import { formatarData } from "../../utils/formatters";
import {
  Consignataria,
  PaginatedResponse,
  Servidor,
  Usuario,
} from "../../types/entidades";
import styles from "./overview.module.css";

type UsuarioExt = Usuario & {
  mfa_habilitado?: boolean;
  aceitou_termos?: boolean;
};

type DashboardStats = {
  totalServidores: number;
  totalConsignatarias: number;
  totalUsuarios: number;
  servidoresInativosOuBloqueados: number;
  consignatariasSuspensasOuInativas: number;
  usuariosBloqueados: number;
  usuariosComMfa: number;
  usuariosPendentesLgpd: number;
  consignatariasAtivas: number;
  usuariosAtivos: number;
};

const initialStats: DashboardStats = {
  totalServidores: 0,
  totalConsignatarias: 0,
  totalUsuarios: 0,
  servidoresInativosOuBloqueados: 0,
  consignatariasSuspensasOuInativas: 0,
  usuariosBloqueados: 0,
  usuariosComMfa: 0,
  usuariosPendentesLgpd: 0,
  consignatariasAtivas: 0,
  usuariosAtivos: 0,
};

// Conteúdo removido: seções mock/“checklists” que não representam entregas funcionais do dashboard.

function resolveDomainTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  const normalized = status.toUpperCase();
  if (["ATIVO", "ATIVA", "OK"].includes(normalized)) return "success";
  if (["SUSPENSA", "PARCIAL"].includes(normalized)) return "warning";
  if (["BLOQUEADO", "INATIVO", "PENDENTE"].includes(normalized))
    return "danger";
  return "neutral";
}

function formatarStatusInterface(value: "ok" | "parcial" | "pendente") {
  if (value === "ok") return "OK";
  if (value === "parcial") return "Parcial";
  return "Pendente";
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentServidores, setRecentServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [serv, cons, user] = await Promise.all([
        apiFetch<PaginatedResponse<Servidor>>("/v1/servidores?limit=1000"),
        apiFetch<PaginatedResponse<Consignataria>>(
          "/v1/consignatarias?limit=1000",
        ),
        apiFetch<PaginatedResponse<UsuarioExt>>("/v1/usuarios?limit=1000"),
      ]);

      const servidoresInativosOuBloqueados = serv.items.filter(
        (item) => item.status !== "ATIVO",
      ).length;

      const consignatariasAtivas = cons.items.filter(
        (item) => item.status === "ATIVA",
      ).length;

      const consignatariasSuspensasOuInativas = cons.items.filter(
        (item) => item.status === "SUSPENSA" || item.status === "INATIVA",
      ).length;

      const usuariosAtivos = user.items.filter(
        (item) => item.status === "ATIVO",
      ).length;
      const usuariosBloqueados = user.items.filter(
        (item) => item.status === "BLOQUEADO",
      ).length;
      const usuariosComMfa = user.items.filter(
        (item) => item.mfa_habilitado,
      ).length;
      const usuariosPendentesLgpd = user.items.filter(
        (item) => item.aceitou_termos === false,
      ).length;

      const recentes = [...serv.items]
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        .slice(0, 6);

      setStats({
        totalServidores: serv.meta.total,
        totalConsignatarias: cons.meta.total,
        totalUsuarios: user.meta.total,
        servidoresInativosOuBloqueados,
        consignatariasSuspensasOuInativas,
        usuariosBloqueados,
        usuariosComMfa,
        usuariosPendentesLgpd,
        consignatariasAtivas,
        usuariosAtivos,
      });
      setRecentServidores(recentes);
    } catch (err) {
      const anyErr = err as any;
      const details =
        anyErr?.error || anyErr?.message || anyErr?.status || anyErr;
      console.error("Erro ao buscar estatísticas", details);
    } finally {
      setLoading(false);
    }
  }

  const percentualMfa =
    stats.totalUsuarios > 0
      ? Math.round((stats.usuariosComMfa / stats.totalUsuarios) * 100)
      : 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Painel Operacional de Consignações</h1>
          <p className={styles.subtitle}>
            Visão executiva dos módulos ativos, requisitos obrigatórios e
            pendências do core.
          </p>
        </div>
        <Badge tone="neutral">Base operacional</Badge>
      </div>

      <section className={styles.kpiGrid}>
        <Card className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Servidores cadastrados</span>
          <strong className={styles.kpiValue}>
            {loading ? "..." : stats.totalServidores}
          </strong>
          <span className={styles.kpiMeta}>
            {loading
              ? ""
              : `${stats.servidoresInativosOuBloqueados} com restrição de status`}
          </span>
        </Card>

        <Card className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Consignatárias ativas</span>
          <strong className={styles.kpiValue}>
            {loading ? "..." : stats.consignatariasAtivas}
          </strong>
          <span className={styles.kpiMeta}>
            {loading
              ? ""
              : `${stats.totalConsignatarias} total | ${stats.consignatariasSuspensasOuInativas} suspensas/inativas`}
          </span>
        </Card>

        <Card className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Usuários ativos</span>
          <strong className={styles.kpiValue}>
            {loading ? "..." : stats.usuariosAtivos}
          </strong>
          <span className={styles.kpiMeta}>
            {loading ? "" : `${stats.usuariosBloqueados} usuários bloqueados`}
          </span>
        </Card>

        <Card className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Cobertura MFA</span>
          <strong className={styles.kpiValue}>
            {loading ? "..." : `${percentualMfa}%`}
          </strong>
          <span className={styles.kpiMeta}>
            {loading
              ? ""
              : `${stats.usuariosPendentesLgpd} pendentes de aceite LGPD`}
          </span>
        </Card>
      </section>

      <section className={styles.dashboardGrid}>
        <div className={styles.mainColumn}>
          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Alertas operacionais</h2>
              <Badge tone={stats.usuariosBloqueados > 0 ? "danger" : "neutral"}>
                {stats.usuariosBloqueados > 0 ? "Atenção" : "Em dia"}
              </Badge>
            </div>

            <div className={styles.metricList}>
              <div className={styles.metricRow}>
                <span>Usuários bloqueados</span>
                <div className={styles.metricRight}>
                  <strong>{loading ? "..." : stats.usuariosBloqueados}</strong>
                  <Badge
                    tone={resolveDomainTone(
                      stats.usuariosBloqueados > 0 ? "PENDENTE" : "OK",
                    )}
                  >
                    {stats.usuariosBloqueados > 0 ? "Requer ação" : "OK"}
                  </Badge>
                </div>
              </div>

              <div className={styles.metricRow}>
                <span>Pendências de aceite LGPD</span>
                <div className={styles.metricRight}>
                  <strong>
                    {loading ? "..." : stats.usuariosPendentesLgpd}
                  </strong>
                  <Badge
                    tone={resolveDomainTone(
                      stats.usuariosPendentesLgpd > 0 ? "PENDENTE" : "OK",
                    )}
                  >
                    {stats.usuariosPendentesLgpd > 0 ? "Pendente" : "OK"}
                  </Badge>
                </div>
              </div>

              <div className={styles.metricRow}>
                <span>Consignatárias suspensas/inativas</span>
                <div className={styles.metricRight}>
                  <strong>
                    {loading ? "..." : stats.consignatariasSuspensasOuInativas}
                  </strong>
                  <Badge
                    tone={resolveDomainTone(
                      stats.consignatariasSuspensasOuInativas > 0
                        ? "PARCIAL"
                        : "OK",
                    )}
                  >
                    {stats.consignatariasSuspensasOuInativas > 0
                      ? "Monitorar"
                      : "OK"}
                  </Badge>
                </div>
              </div>

              <div className={styles.metricRow}>
                <span>Servidores inativos ou bloqueados</span>
                <div className={styles.metricRight}>
                  <strong>
                    {loading ? "..." : stats.servidoresInativosOuBloqueados}
                  </strong>
                  <Badge
                    tone={resolveDomainTone(
                      stats.servidoresInativosOuBloqueados > 0
                        ? "PARCIAL"
                        : "OK",
                    )}
                  >
                    {stats.servidoresInativosOuBloqueados > 0
                      ? "Revisar"
                      : "OK"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.sideColumn}>
          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Resumo rápido</h2>
              <Badge tone="neutral">Atualizado</Badge>
            </div>

            <ul className={styles.simpleList}>
              <li>
                <strong>{loading ? "..." : stats.consignatariasAtivas}</strong>{" "}
                consignatárias ativas
              </li>
              <li>
                <strong>{loading ? "..." : stats.usuariosAtivos}</strong>{" "}
                usuários ativos
              </li>
              <li>
                <strong>{loading ? "..." : `${percentualMfa}%`}</strong>{" "}
                cobertura MFA
              </li>
            </ul>
          </Card>
        </div>
      </section>

      <section className={styles.recentSection}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Servidores atualizados recentemente</h2>
            <Badge tone="neutral">Base real</Badge>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Situação Funcional</th>
                <th>Status</th>
                <th>Última Atualização</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className={styles.tableLoadingCell} colSpan={5}>
                    Carregando dados...
                  </td>
                </tr>
              ) : recentServidores.length === 0 ? (
                <tr>
                  <td className={styles.tableLoadingCell} colSpan={5}>
                    Nenhum servidor encontrado na base.
                  </td>
                </tr>
              ) : (
                recentServidores.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.nameCell}>{item.nome}</div>
                      <div className={styles.nameSubtext}>{item.cargo}</div>
                    </td>
                    <td>{item.matricula}</td>
                    <td>{item.situacao_funcional}</td>
                    <td>
                      <Badge tone={resolveDomainTone(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td>{formatarData(item.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
