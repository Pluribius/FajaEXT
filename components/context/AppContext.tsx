'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppUser, SupportTicket, NewsPost, UserRole, VerificationStatus, profileToAppUser, SupabaseProfile } from '@/lib/types';
import { INITIAL_USERS, INITIAL_NEWS, INITIAL_TICKETS } from '@/lib/mockData';
import {
  supabase,
  getProfilesFromSupabase,
  getProfileById,
  upsertProfileInSupabase,
  updateVerificationInSupabase,
  bulkUpdateVerificationInSupabase,
  deleteUserFromSupabase,
  checkSupabaseConnection,
  resendConfirmationEmail,
  updateUserEmail,
  updateUserPassword
} from '@/lib/supabase';

interface EmailConfirmationData {
  email: string;
  fullName: string;
  idNumber: string;
}

interface AppContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  tickets: SupportTicket[];
  news: NewsPost[];
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  isVideoModalOpen: boolean;
  confirmationEmailData: EmailConfirmationData | null;
  activeView: 'landing' | 'portal';
  adminSubView: 'dashboard' | 'viewer';
  setAdminSubView: (view: 'dashboard' | 'viewer') => void;
  supabaseConnected: boolean;
  isSupabaseLoading: boolean;

  // Navigation & Modal triggers
  setActiveView: (view: 'landing' | 'portal') => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openVideoModal: () => void;
  closeVideoModal: () => void;
  setConfirmationEmailData: (data: EmailConfirmationData | null) => void;
  closeConfirmationEmail: () => void;

  // Authentication & Users
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    idNumber: string;
    idPhotoUrl: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickSwitchRole: (role: UserRole) => void;
  refreshSupabaseUsers: () => Promise<void>;

  // Security and Account updates
  resendConfirmation: (email?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  changeEmail: (newEmail: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;

  // Admin User Management
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  toggleViewerVisibility: (id: string) => void;
  reviewUserStatus: (id: string, status: VerificationStatus, notes?: string) => void;
  bulkReviewUserStatus: (ids: string[], status: VerificationStatus, notes?: string) => Promise<void>;
  bulkToggleViewerVisibility: (ids: string[], visible: boolean) => void;

  // Tickets
  createTicket: (data: {
    subject: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    message: string;
  }) => void;
  replyToTicket: (ticketId: string, reply: string, status: SupportTicket['status']) => void;

  // News
  addNews: (data: Omit<NewsPost, 'id' | 'date'>) => void;
  deleteNews: (id: string) => void;

  // Reset to default
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'petrolink_users_v2';
const TICKETS_STORAGE_KEY = 'petrolink_tickets_v2';
const NEWS_STORAGE_KEY = 'petrolink_news_v2';
const CURRENT_USER_KEY = 'petrolink_current_user_v2';
const ACTIVE_VIEW_KEY = 'petrolink_active_view_v2';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [news, setNews] = useState<NewsPost[]>(INITIAL_NEWS);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [confirmationEmailData, setConfirmationEmailData] = useState<EmailConfirmationData | null>(null);
  const [activeView, setActiveViewState] = useState<'landing' | 'portal'>('landing');
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'viewer'>('dashboard');

  // Supabase status
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);

  // Helper to persist and change view
  const setActiveView = (view: 'landing' | 'portal') => {
    setActiveViewState(view);
    try {
      localStorage.setItem(ACTIVE_VIEW_KEY, view);
    } catch {}
  };

  // Load from localStorage on mount (Session Persistence)
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      }

      const storedTickets = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (storedTickets) {
        setTickets(JSON.parse(storedTickets));
      } else {
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      }

      const storedNews = localStorage.getItem(NEWS_STORAGE_KEY);
      if (storedNews) {
        setNews(JSON.parse(storedNews));
      } else {
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(INITIAL_NEWS));
      }

      // Restore user session and last active view
      const storedCurrent = localStorage.getItem(CURRENT_USER_KEY);
      const storedView = localStorage.getItem(ACTIVE_VIEW_KEY);
      if (storedCurrent) {
        const parsedUser: AppUser = JSON.parse(storedCurrent);
        setCurrentUser(parsedUser);
        // Automatically restore user into their portal view!
        setActiveViewState((storedView as any) || 'portal');
      } else if (storedView) {
        setActiveViewState(storedView as any);
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
  }, []);

  // Save to localStorage when updated
  const saveUsers = useCallback((newUsers: AppUser[]) => {
    setUsers(newUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, []);

  const saveTickets = (newTickets: SupportTicket[]) => {
    setTickets(newTickets);
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(newTickets));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const saveNews = (newNews: NewsPost[]) => {
    setNews(newNews);
    try {
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(newNews));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const saveCurrentUser = useCallback((user: AppUser | null) => {
    setCurrentUser(user);
    if (user) {
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(ACTIVE_VIEW_KEY, 'portal');
      } catch {}
      setActiveViewState('portal');
    } else {
      try {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.setItem(ACTIVE_VIEW_KEY, 'landing');
      } catch {}
      setActiveViewState('landing');
    }
  }, []);

  // Sync Supabase Profiles
  const refreshSupabaseUsers = useCallback(async () => {
    setIsSupabaseLoading(true);
    try {
      const conn = await checkSupabaseConnection();
      setSupabaseConnected(conn.connected);

      const { success, users: sbUsers } = await getProfilesFromSupabase();
      if (success && sbUsers && sbUsers.length > 0) {
        setUsers((prev) => {
          // Merge Supabase profiles with local demo accounts, keeping unique by email and id
          const merged = [...sbUsers];
          for (const u of prev) {
            if (!merged.some((m) => m.id === u.id || m.email.toLowerCase() === u.email.toLowerCase())) {
              merged.push(u);
            }
          }
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.warn('[Supabase] Initial load error:', err);
    } finally {
      setIsSupabaseLoading(false);
    }
  }, []);

  // Initial Supabase connection check and subscription setup
  useEffect(() => {
    refreshSupabaseUsers();

    // Setup Supabase Realtime Channel on public.profiles
    const channel = supabase
      .channel('realtime_profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('[Supabase Realtime] Event on profiles:', payload.eventType);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updated = profileToAppUser(payload.new as SupabaseProfile);
            setUsers((prev) => {
              const idx = prev.findIndex((u) => u.id === updated.id || u.email.toLowerCase() === updated.email.toLowerCase());
              let nextList: AppUser[];
              if (idx >= 0) {
                nextList = [...prev];
                nextList[idx] = { ...prev[idx], ...updated };
              } else {
                nextList = [updated, ...prev];
              }
              try {
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextList));
              } catch {}
              return nextList;
            });
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as any)?.id;
            if (oldId) {
              setUsers((prev) => prev.filter((u) => u.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    // Check if user already has an active Supabase session
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata || {};
        const fullName =
          meta.first_name && meta.last_name
            ? `${meta.first_name} ${meta.last_name}`
            : meta.full_name || u.email?.split('@')[0] || 'Usuario';

        const sessionUser: AppUser = {
          id: u.id,
          fullName,
          email: u.email || '',
          phone: meta.phone || '',
          idNumber: meta.id_number || '000000',
          idPhotoUrl: meta.id_photo_url || '/images/formato vacio rif.png',
          role: (meta.role as UserRole) || (u.email?.includes('admin') ? 'admin' : u.email?.includes('visor') ? 'viewer' : 'client'),
          status: 'aprobado',
          visibleToViewers: true,
          createdAt: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        };
        // Restore session if currentUser was not yet populated
        setCurrentUser((current) => current || sessionUser);

        // Fetch their full database profile to load their official cédula document URL
        getProfileById(u.id).then((profile) => {
          if (profile) {
            setCurrentUser(profile);
            saveCurrentUser(profile);
          }
        });
      }
    });

    // Supabase auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const fullName =
          meta.first_name && meta.last_name
            ? `${meta.first_name} ${meta.last_name}`
            : meta.full_name || u.email?.split('@')[0] || 'Usuario';

        const sessionUser: AppUser = {
          id: u.id,
          fullName,
          email: u.email || '',
          phone: meta.phone || '',
          idNumber: meta.id_number || '000000',
          idPhotoUrl: meta.id_photo_url || '/images/formato vacio rif.png',
          role: (meta.role as UserRole) || (u.email?.includes('admin') ? 'admin' : u.email?.includes('visor') ? 'viewer' : 'client'),
          status: 'aprobado',
          visibleToViewers: true,
          createdAt: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        };
        saveCurrentUser(sessionUser);
      }
    });

    return () => {
      supabase.removeChannel(channel);
      authListener?.subscription.unsubscribe();
    };
  }, [refreshSupabaseUsers, saveCurrentUser]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openVideoModal = () => setIsVideoModalOpen(true);
  const closeVideoModal = () => setIsVideoModalOpen(false);
  const closeConfirmationEmail = () => setConfirmationEmailData(null);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Fast demo login or password-less demo accounts
    const isDemoAccount =
      cleanEmail === 'admin@petrolink.com' ||
      cleanEmail === 'visor@petrolink.com' ||
      cleanEmail === 'cliente@petrolink.com';

    if (isDemoAccount && (!password || password.length < 6 || password === 'admin' || password === 'demo')) {
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (found) {
        saveCurrentUser(found);
        setIsAuthModalOpen(false);
        setActiveView('portal');
        return { success: true };
      }
    }

    // 2. Attempt Supabase Auth login if password is provided
    if (password && password.length >= 6) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authErr && authData?.user) {
          // Fetch their Supabase profile and linked documents
          const profileData = await getProfileById(authData.user.id);

          let loggedInUser: AppUser;
          if (profileData) {
            loggedInUser = profileData;
          } else {
            const meta = authData.user.user_metadata || {};
            const fullName =
              meta.first_name && meta.last_name
                ? `${meta.first_name} ${meta.last_name}`
                : meta.full_name || cleanEmail.split('@')[0];

            loggedInUser = {
              id: authData.user.id,
              fullName,
              email: cleanEmail,
              phone: meta.phone || '',
              idNumber: meta.id_number || '000000',
              idPhotoUrl: meta.id_photo_url || '/images/formato vacio rif.png',
              role: (meta.role as UserRole) || (cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('visor') ? 'viewer' : 'client'),
              status: 'aprobado',
              visibleToViewers: true,
              createdAt: authData.user.created_at ? authData.user.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            };
          }

          saveCurrentUser(loggedInUser);
          setIsAuthModalOpen(false);
          setActiveView('portal');
          return { success: true };
        }
      } catch (err) {
        console.warn('[Supabase Login Error]:', err);
      }
    }

    // 3. Fallback to local accounts match
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (found.password && password && found.password !== password) {
        return { success: false, error: 'Contraseña incorrecta para esta cuenta.' };
      }
      saveCurrentUser(found);
      setIsAuthModalOpen(false);
      setActiveView('portal');
      return { success: true };
    }

    return { success: false, error: 'No se encontró ninguna cuenta con este correo electrónico.' };
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    idNumber: string;
    idPhotoUrl: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = payload.email.trim().toLowerCase();

    // Check if email already belongs to a registered user
    const existing = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && !u.id.startsWith('usr-admin-') && !u.id.startsWith('usr-view-')
    );
    if (existing && existing.id.includes('-') && existing.id.length > 25) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }


    const nameParts = payload.fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Usuario';
    const lastName = nameParts.slice(1).join(' ') || 'Registrado';

    // Generate a valid UUID format for Supabase compatibility
    const generatedUuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');

    let finalUserId = generatedUuid;

    // 1. Try Supabase Auth Sign Up
    if (payload.password && payload.password.length >= 6) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: payload.password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: payload.fullName.trim(),
              phone: payload.phone.trim(),
              id_number: payload.idNumber.trim(),
              id_photo_url: payload.idPhotoUrl,
              role: 'client',
            },
          },
        });

        if (authData?.user?.id) {
          finalUserId = authData.user.id;
        } else if (authErr) {
          console.warn('[Supabase Auth SignUp note]:', authErr.message);
        }
      } catch (err: any) {
        console.warn('[Supabase SignUp exception]:', err?.message);
      }
    }

    // 2. Direct save to Supabase public.profiles table
    try {
      await upsertProfileInSupabase({
        id: finalUserId,
        fullName: payload.fullName,
        email: cleanEmail,
        phone: payload.phone,
        idNumber: payload.idNumber,
        idPhotoUrl: payload.idPhotoUrl,
        verificationStatus: 'pending',
      });
    } catch (upsertErr) {
      console.warn('[Supabase upsertProfile note]:', upsertErr);
    }

    // 3. Build user object and persist session in browser
    const newUser: AppUser = {
      id: finalUserId,
      fullName: payload.fullName.trim(),
      email: cleanEmail,
      phone: payload.phone.trim(),
      idNumber: payload.idNumber.trim(),
      idPhotoUrl: payload.idPhotoUrl || '/images/formato vacio rif.png',
      password: payload.password,
      role: 'client',
      status: 'pendiente',
      visibleToViewers: false,
      createdAt: new Date().toISOString().split('T')[0],
      notes: 'Usuario registrado vía portal web. Cédula pendiente de verificación.',
    };

    const updatedUsers = [newUser, ...users];
    saveUsers(updatedUsers);
    saveCurrentUser(newUser);
    setIsAuthModalOpen(false);

    // Direct entry to portal without email confirmation step
    setActiveView('portal');
    return { success: true };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    saveCurrentUser(null);
  };

  const quickSwitchRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role);
    if (matched) {
      saveCurrentUser(matched);
      setActiveView('portal');
    }
  };

  // Re-send verification confirmation email
  const resendConfirmation = async (
    email?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const targetEmail = email || confirmationEmailData?.email || currentUser?.email;
    if (!targetEmail) {
      return { success: false, error: 'No se encontró una dirección de correo para reenviar.' };
    }
    return await resendConfirmationEmail(targetEmail);
  };

  // Change user email and resend verification
  const changeEmail = async (
    newEmail: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No hay usuario autenticado.' };
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
    }

    const res = await updateUserEmail(cleanEmail, currentUser.id);

    // Update in current user session and users list
    const updated = { ...currentUser, email: cleanEmail };
    saveCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, email: cleanEmail } : u)));

    // Reopen confirmation email modal for new email address
    setConfirmationEmailData({
      email: cleanEmail,
      fullName: currentUser.fullName,
      idNumber: currentUser.idNumber,
    });

    return res;
  };

  // Change user password
  const changePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No hay usuario autenticado.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const res = await updateUserPassword(newPassword);

    // Update in local user
    const updated = { ...currentUser, password: newPassword };
    saveCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u)));

    return res;
  };

  // Admin user operations
  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `usr-${Date.now()}`;

    const newUser: AppUser = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveUsers([newUser, ...users]);

    // Sync to Supabase
    upsertProfileInSupabase({
      id: newId,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      idNumber: newUser.idNumber,
      idPhotoUrl: newUser.idPhotoUrl,
      verificationStatus: newUser.status,
      batchId: newUser.batchId,
    });
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    saveUsers(updated);
    if (currentUser?.id === id) {
      saveCurrentUser({ ...currentUser, ...updates });
    }
    // Sync verification status to Supabase if it's a UUID
    if (id.includes('-') && id.length > 20 && updates.status) {
      updateVerificationInSupabase(id, updates.status, updates.batchId);
    }
  };

  const deleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    saveUsers(updated);
    if (currentUser?.id === id) {
      logout();
    }
    // Delete from Supabase if UUID
    if (id.includes('-') && id.length > 20) {
      deleteUserFromSupabase(id);
    }
  };

  const toggleViewerVisibility = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        return { ...u, visibleToViewers: !u.visibleToViewers };
      }
      return u;
    });
    saveUsers(updated);
  };

  const bulkToggleViewerVisibility = (ids: string[], visible: boolean) => {
    const updated = users.map((u) => {
      if (ids.includes(u.id)) {
        return { ...u, visibleToViewers: visible };
      }
      return u;
    });
    saveUsers(updated);
  };

  const reviewUserStatus = (id: string, status: VerificationStatus, notes?: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          status,
          verifiedAt: status === 'aprobado' ? new Date().toISOString().split('T')[0] : u.verifiedAt,
          notes: notes !== undefined ? notes : u.notes,
        };
      }
      return u;
    });
    saveUsers(updated);

    // Sync to Supabase
    if (id.includes('-') && id.length > 20) {
      updateVerificationInSupabase(id, status);
    }
  };

  const bulkReviewUserStatus = async (ids: string[], status: VerificationStatus, notes?: string) => {
    const updated = users.map((u) => {
      if (ids.includes(u.id)) {
        return {
          ...u,
          status,
          verifiedAt: status === 'aprobado' ? new Date().toISOString().split('T')[0] : u.verifiedAt,
          notes: notes !== undefined ? notes : u.notes,
        };
      }
      return u;
    });
    saveUsers(updated);

    const uuidIds = ids.filter((id) => id.includes('-') && id.length > 20);
    if (uuidIds.length > 0) {
      await bulkUpdateVerificationInSupabase(uuidIds, status);
    }
  };

  // Ticket operations
  const createTicket = (data: {
    subject: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    message: string;
  }) => {
    if (!currentUser) return;
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      message: data.message,
      status: 'Abierto',
      createdAt: new Date().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }),
    };
    saveTickets([newTicket, ...tickets]);
  };

  const replyToTicket = (ticketId: string, reply: string, status: SupportTicket['status']) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          adminReply: reply,
          status,
          repliedAt: new Date().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }),
        };
      }
      return t;
    });
    saveTickets(updated);
  };

  // News operations
  const addNews = (data: Omit<NewsPost, 'id' | 'date'>) => {
    const newPost: NewsPost = {
      ...data,
      id: `news-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    saveNews([newPost, ...news]);
  };

  const deleteNews = (id: string) => {
    const updated = news.filter((n) => n.id !== id);
    saveNews(updated);
  };

  const resetDemoData = () => {
    saveUsers(INITIAL_USERS);
    saveTickets(INITIAL_TICKETS);
    saveNews(INITIAL_NEWS);
    saveCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        tickets,
        news,
        isAuthModalOpen,
        authModalTab,
        isVideoModalOpen,
        confirmationEmailData,
        activeView,
        adminSubView,
        setAdminSubView,
        supabaseConnected,
        isSupabaseLoading,
        setActiveView,
        openAuthModal,
        closeAuthModal,
        openVideoModal,
        closeVideoModal,
        setConfirmationEmailData,
        closeConfirmationEmail,
        login,
        register,
        logout,
        quickSwitchRole,
        refreshSupabaseUsers,
        resendConfirmation,
        changeEmail,
        changePassword,
        addUser,
        updateUser,
        deleteUser,
        toggleViewerVisibility,
        reviewUserStatus,
        bulkReviewUserStatus,
        bulkToggleViewerVisibility,
        createTicket,
        replyToTicket,
        addNews,
        deleteNews,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
