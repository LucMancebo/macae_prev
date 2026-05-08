"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, FormField, Input } from "../../design-system/components";
import styles from "./login.module.css";

type LoginStep = "LOGIN" | "MFA" | "LGPD";

export default function LoginPage() {
  // Estados do Formulário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [step, setStep] = useState<LoginStep>("LOGIN");
  const [error, setError] = useState("");

  // Dados temporários para os desafios
  const [usuarioId, setUsuarioId] = useState("");
  const [termoAtual, setTermoAtual] = useState<{
    id: string;
    conteudo: string;
    versao: string;
  } | null>(null);

  const { login, verifyMfa, acceptTerms, loading } = useAuth();

  // Buscar termos se o passo for LGPD
  useEffect(() => {
    if (step === "LGPD") {
      fetchTermos();
    }
  }, [step]);

  async function fetchTermos() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/v1/auth/terms`,
      );
      const data = await response.json();
      setTermoAtual(data);
    } catch (err) {
      setError("Erro ao carregar termos de uso.");
    }
  }

  async function handleInitialLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, senha);

      if (res.mfa_requerido) {
        setUsuarioId(res.usuarioId);
        setStep("MFA");
      } else if (res.termos_requeridos) {
        setUsuarioId(res.usuarioId);
        setStep("LGPD");
      }
      // Se não houver pendências, o AuthContext já redireciona para o dashboard
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas ou conta bloqueada.");
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await verifyMfa(usuarioId, mfaCode);
    } catch (err: any) {
      setError(err.message || "Código MFA inválido.");
    }
  }

  async function handleLgpdAccept() {
    setError("");
    if (!termoAtual) return;
    try {
      await acceptTerms(usuarioId, termoAtual.id);
      // Após aceitar, volta para o login para finalizar
      setStep("LOGIN");
      alert(
        "Termos aceitos com sucesso! Por favor, realize o login novamente.",
      );
    } catch (err: any) {
      setError(err.message || "Erro ao processar aceite.");
    }
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>MACAEPREV</h1>
          <p className={styles.subtitle}>Gestão de Consignações</p>
        </div>

        {/* PASSO 1: LOGIN TRADICIONAL */}
        {step === "LOGIN" && (
          <form onSubmit={handleInitialLogin} className={styles.form}>
            <FormField label="E-mail Institucional">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemplo@macae.rj.gov.br"
              />
            </FormField>

            <FormField label="Senha de Acesso">
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••••"
              />
            </FormField>

            {error && (
              <div className={styles.error} role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Acessar Sistema
            </Button>
          </form>
        )}

        {/* PASSO 2: AUTENTICAÇÃO MULTIFATOR (MFA) */}
        {step === "MFA" && (
          <form onSubmit={handleMfaSubmit} className={styles.form}>
            <div className={styles.mfaGroup}>
              <div className={styles.mfaIcon}>🔐</div>
              <h2 className={styles.mfaTitle}>Verificação de Segurança</h2>
              <p className={styles.mfaHint}>
                Insira o código de 6 dígitos gerado pelo seu aplicativo
                autenticador.
              </p>
              <Input
                className={styles.mfaInput}
                type="text"
                value={mfaCode}
                onChange={(e) =>
                  setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                placeholder="000 000"
                inputMode="numeric"
              />
            </div>

            {error && (
              <div className={styles.error} role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              disabled={mfaCode.length < 6}
            >
              Confirmar Código
            </Button>

            <Button
              onClick={() => setStep("LOGIN")}
              type="button"
              variant="ghost"
              fullWidth
              className={styles.backButton}
            >
              Voltar
            </Button>
          </form>
        )}

        {/* PASSO 3: ACEITE LGPD */}
        {step === "LGPD" && (
          <div>
            <div className={styles.mfaIcon}>📄</div>
            <h2 className={styles.mfaTitle}>Termos de Privacidade (LGPD)</h2>
            <p className={styles.mfaHint}>
              Para prosseguir, você precisa ler e aceitar os termos de uso e
              política de privacidade do MACAEPREV.
            </p>

            <div className={styles.termsScroll}>
              <div className={styles.termsTitle}>
                Versão {termoAtual?.versao || "..."}
              </div>
              {termoAtual?.conteudo || "Carregando termos..."}
            </div>

            {error && (
              <div className={styles.error} role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <Button
              onClick={handleLgpdAccept}
              loading={loading}
              fullWidth
              disabled={!termoAtual}
            >
              Li e aceito os termos
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
