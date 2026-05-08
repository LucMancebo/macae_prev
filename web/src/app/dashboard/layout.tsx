"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../../design-system/components";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const breadcrumbMap: Record<string, string> = {
    "/dashboard": "Painel Operacional",
    "/dashboard/servidores": "Servidores",
    "/dashboard/consignatarias": "Consignatárias",
    "/dashboard/usuarios": "Usuários",
  };

  const breadcrumbTitle = breadcrumbMap[pathname] ?? "Painel Operacional";

  const menuGroups = [
    {
      label: "Painel",
      items: [{ name: "Visão Geral", path: "/dashboard", icon: "⌂" }],
    },
    {
      label: "Cadastros",
      items: [
        { name: "Servidores", path: "/dashboard/servidores", icon: "👤" },
        {
          name: "Consignatárias",
          path: "/dashboard/consignatarias",
          icon: "🏦",
        },
        { name: "Usuários", path: "/dashboard/usuarios", icon: "🔐" },
      ],
    },
  ];

  if (!user) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>M</div>
          <div>
            <div className={styles.brandName}>MACAEPREV</div>
            <div className={styles.brandMeta}>Consignações</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {menuGroups.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <div className={styles.navGroupLabel}>{group.label}</div>
              <div className={styles.navGroupItems}>
                {group.items.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <Button variant="secondary" fullWidth onClick={logout}>
            Sair do sistema
          </Button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarCrumbs}>
            <span className={styles.crumbMuted}>Sistema</span>
            <span className={styles.crumbDivider}>/</span>
            <span className={styles.crumbActive}>{breadcrumbTitle}</span>
          </div>

          <div className={styles.topbarSearch}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Busca rápida por servidor, CPF ou matrícula"
              aria-label="Busca rápida"
            />
            <span className={styles.searchShortcut}>/</span>
          </div>

          <div className={styles.topbarActions}>
            <button className={styles.topbarIconBtn} aria-label="Manual online">
              ?
            </button>
            <button
              className={styles.topbarIconBtn}
              aria-label="Notificações de aprovação"
            >
              🔔
            </button>
            <div className={styles.userChip}>
              <span className={styles.userAvatar}>
                {user.nome?.charAt(0) || "U"}
              </span>
              <span className={styles.userMeta}>
                <strong>{user.nome}</strong>
                <span>{user.perfil}</span>
              </span>
            </div>
          </div>
        </header>

        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
}
