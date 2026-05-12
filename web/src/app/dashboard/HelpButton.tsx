"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./help-button.module.css";

interface HelpButtonProps {
  /** Título do modal de ajuda */
  title: string;
  /** Conteúdo descritivo/instrucional para ajudar o usuário */
  content: React.ReactNode;
  /** Se informado, adicionará um link para a âncora específica na página do Manual Completo */
  topicSlug?: string;
}

export default function HelpButton({
  title,
  content,
  topicSlug,
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setIsOpen(true)}
        aria-label={`Ajuda sobre ${title}`}
        title={`Ajuda: ${title}`}
      >
        ?
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="help-title" className={styles.modalTitle}>
                <span aria-hidden="true">💡</span> Ajuda: {title}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Fechar ajuda"
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              {content}
              {topicSlug && (
                <div style={{ marginTop: "1rem" }}>
                  <Link
                    href={`/dashboard/ajuda#${topicSlug}`}
                    style={{ color: "var(--brand-primary)", fontWeight: 500 }}
                  >
                    Ler mais no Manual On-line →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
