'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
//Definición de variables
interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
}
//inicializacion de variables
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  register: (payload: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

//creacion de sesion, context y conexion con la api
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter(); // Initialize router


  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sigis_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/login/access-token`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('sigis_token', data.access_token);
      setToken(data.access_token);
      await fetchUserProfile(data.access_token);
      router.push('/dashboard');
      return { success: true };
    } else {
      // Return this if the login fails (e.g., wrong password)
      return { success: false, error: data.detail || 'Credenciales incorrectas' };
    }
  } catch (err) {
    // This handles network errors
    return { success: false, error: 'Error de red. No se pudo conectar con el servidor.' };
  }
};

  const register = async (payload: any) => {
    try {
      // users.py parses a JSON body for registrations mapped onto UserRegister schema models
      const response = await fetch(`${API_URL}/api/v1/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.detail || 'Fallo al procesar el registro.' };
      }

      // Automatically sign in the user if the registration was successful
      const loginForm = new FormData();
      loginForm.append('username', payload.email);
      loginForm.append('password', payload.password);
      return await login(loginForm);
    } catch (err) {
      return { success: false, error: 'Error de red durante el registro.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('sigis_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be wrapped inside an AuthProvider');
  return context;
};