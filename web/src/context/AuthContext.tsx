'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, MeResponse } from '../types/auth';
import { apiFetch } from '../services/api';
import { useRouter } from 'next/navigation';

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

    useEffect(() => {
        const storedToken = localStorage.getItem('macae_prev_token');
        if (storedToken) {
            setToken(storedToken);
            loadUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    async function loadUser(storedToken: string) {
        try {
            const data = await apiFetch<MeResponse>('/v1/auth/me', {
                headers: { Authorization: `Bearer ${storedToken}` }
            });
            setUser(data.user);
        } catch (error) {
            console.error('Falha ao carregar usuário:', error);
            logout();
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, senha: string): Promise<AuthResponse> {
        setLoading(true);
        try {
            const data = await apiFetch<AuthResponse>('/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, senha }),
            });

            if (!data.mfa_requerido && !data.termos_requeridos) {
                await finalizeLogin(data.token);
            }
            
            return data;
        } catch (error) {
            setLoading(false);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function verifyMfa(usuarioId: string, code: string) {
        setLoading(true);
        try {
            const data = await apiFetch<AuthResponse>('/v1/auth/login-mfa', {
                method: 'POST',
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

    async function acceptTerms(usuarioId: string, termoId: string) {
        setLoading(true);
        try {
            await apiFetch('/v1/auth/accept-terms', {
                method: 'POST',
                body: JSON.stringify({ usuarioId, termoId }),
            });
            // Após aceitar termos, o usuário precisa tentar o login novamente 
            // ou podemos tentar logar automaticamente se tivéssemos a senha salva.
            // Para segurança, vamos apenas retornar e o LoginPage lidará com isso.
        } catch (error) {
            setLoading(false);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function finalizeLogin(newToken: string) {
        localStorage.setItem('macae_prev_token', newToken);
        setToken(newToken);
        await loadUser(newToken);
        router.push('/dashboard');
    }

    function logout() {
        localStorage.removeItem('macae_prev_token');
        setToken(null);
        setUser(null);
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, verifyMfa, acceptTerms, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
