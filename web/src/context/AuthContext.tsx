"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, AuthResponse, MeResponse } from "../types/auth";
import { apiFetch } from "../services/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<AuthResponse>;
  verifyMfa: (usuarioId: string, code: string) => Promise<void>;
  acceptTerms: (usuarioId: string, termoId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(
    async (redirect = true) => {
      try {
        await apiFetch("/v1/auth/logout", { method: "POST" });
      } catch {
        // ignora falha de logout local
      }
      setToken(null);
      setUser(null);
      if (redirect) {
        router.push("/login");
      }
    },
    [router],
  );

  const loadUserFromSession = useCallback(async () => {
    try {
      const data = await apiFetch<MeResponse>("/v1/auth/me", {});
      setToken("session-cookie");
      setUser(data.user);
    } catch (error: any) {
      if (error?.status === 401 || error?.statusCode === 401) {
        logout(false);
        return;
      }

      console.error("Falha ao carregar usuário:", error);
      logout(false);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    void loadUserFromSession();
  }, [loadUserFromSession]);

  async function login(email: string, senha: string): Promise<AuthResponse> {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      if (!data.mfa_requerido && !data.termos_requeridos) {
        await finalizeLogin(data.token);
      }

      return data;
    } catch (error: any) {
      console.error("Erro detalhado no login:", error);

      // Tratamento específico para erro de conexão (o erro 500 que o Prisma deve gerar)
      if (
        error?.status === 500 ||
        error?.statusCode === 500 ||
        error?.message?.includes("database")
      ) {
        throw new Error(
          "Erro de conexão com o servidor. Tente novamente em instantes.",
        );
      }

      // Se for 401, as credenciais não batem no banco
      const message = error?.message || "E-mail ou senha incorretos.";
      setLoading(false);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyMfa(usuarioId: string, code: string) {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>("/v1/auth/login-mfa", {
        method: "POST",
        body: JSON.stringify({ usuarioId, code }),
      });

      await finalizeLogin(data.token);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const acceptTerms = useCallback(
    async (usuarioId: string, termoId: string) => {
      setLoading(true);
      try {
        await apiFetch("/v1/auth/accept-terms", {
          method: "POST",
          body: JSON.stringify({ usuarioId, termoId }),
        });
        await loadUserFromSession();
        router.push("/dashboard");
      } catch (error) {
        setLoading(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadUserFromSession, router],
  );

  const finalizeLogin = useCallback(
    async (newToken: string) => {
      setToken(newToken || "session-cookie");
      await loadUserFromSession();
      router.push("/dashboard");
    },
    [loadUserFromSession, router],
  );

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, verifyMfa, acceptTerms, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
