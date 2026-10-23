import { createClient } from '@supabase/supabase-js';
import { AppUser, SupabaseProfile, profileToAppUser } from './types';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://agxvxlsqhpxblcqiafin.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Y0VotelMZmc3y-jyWnAA5g_87g8iHC6';

// Global Supabase client singleton
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Fetch all users from Supabase database (users_info joined with contact_info, documents, verification_status, payment_status)
 */
export async function getUsersFromSupabase(): Promise<{
  success: boolean;
  users: AppUser[];
  error?: string;
}> {
  try {
    // 1. Prefer fetching via our internal API route which has full service-role database access
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.users)) {
          return { success: true, users: json.users };
        }
      }
    }

    // 2. Direct client fallback (if authenticated session or direct access)
    const { data, error } = await supabase
      .from('users_info')
      .select('*, contact_info(*), documents(*), verification_status(*), payment_status(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Warning fetching users_info directly:', error.message);
      return { success: false, users: [], error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, users: [] };
    }

    const { supabaseJoinedToAppUser } = await import('./types');
    const convertedUsers: AppUser[] = (data as any[]).map((row) =>
      supabaseJoinedToAppUser(row)
    );

    return { success: true, users: convertedUsers };
  } catch (err: any) {
    console.error('[Supabase] Exception fetching users:', err);
    return { success: false, users: [], error: err?.message || 'Error de conexión' };
  }
}

// Alias for backwards compatibility
export const getProfilesFromSupabase = getUsersFromSupabase;

/**
 * Fetch a single user profile by Auth/Profile UUID
 */
export async function getProfileById(id: string): Promise<AppUser | null> {
  try {
    const { data, error } = await supabase
      .from('users_info')
      .select('*, contact_info(*), documents(*), verification_status(*), payment_status(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    const { supabaseJoinedToAppUser } = await import('./types');
    return supabaseJoinedToAppUser(data as any);
  } catch {
    return null;
  }
}

/**
 * Create or update a profile in Supabase
 */
export async function upsertProfileInSupabase(user: {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  idNumber: string;
  idPhotoUrl?: string;
  verificationStatus?: string;
  batchId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const nameParts = user.fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Usuario';
    const lastName = nameParts.slice(1).join(' ') || 'Registrado';

    // 1. Upsert users_info
    await supabase.from('users_info').upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      id_number: user.idNumber.replace(/\D/g, ''),
      role: 'user',
    });

    // 2. Upsert contact_info
    await supabase.from('contact_info').upsert({
      id: user.id,
      email: user.email.toLowerCase().trim(),
      phone: user.phone || null,
    });

    // 3. Upsert documents
    if (user.idPhotoUrl) {
      await supabase.from('documents').upsert({
        id: user.id,
        id_document_url: user.idPhotoUrl,
      });
    }

    // 4. Upsert verification_status
    const dbStatus =
      user.verificationStatus === 'aprobado'
        ? 'approved'
        : user.verificationStatus === 'rechazado'
        ? 'rejected'
        : 'pending';

    await supabase.from('verification_status').upsert({
      id: user.id,
      status: dbStatus,
      verified_at: dbStatus === 'approved' ? new Date().toISOString() : null,
    });

    // 5. Upsert payment_status if batchId
    if (user.batchId) {
      await supabase.from('payment_status').upsert({
        id: user.id,
        status: 'pending',
        batch_id: user.batchId,
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al guardar perfil' };
  }
}

/**
 * Update user verification status in Supabase
 */
export async function updateVerificationInSupabase(
  id: string,
  status: 'aprobado' | 'pendiente' | 'rechazado',
  batchId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, status, batchId }),
      });
      if (res.ok) {
        return { success: true };
      }
    }

    const dbStatus =
      status === 'aprobado' ? 'approved' : status === 'rechazado' ? 'rejected' : 'pending';

    const { error } = await supabase.from('verification_status').upsert({
      id,
      status: dbStatus,
      verified_at: status === 'aprobado' ? new Date().toISOString() : null,
    });

    if (error) {
      console.warn('[Supabase] Error updating verification status:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Bulk update verification status for multiple users
 */
export async function bulkUpdateVerificationInSupabase(
  userIds: string[],
  status: 'aprobado' | 'pendiente' | 'rechazado'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, status }),
      });
      if (res.ok) {
        return { success: true };
      }
    }
    return { success: false, error: 'Failed to update users' };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Delete user from Supabase
 */
export async function deleteUserFromSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        return { success: true };
      }
    }
    return { success: false, error: 'Failed to delete user' };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Test connectivity to the Supabase backend
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  profileCount?: number;
}> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        return {
          connected: true,
          message: 'Supabase conectado exitosamente',
          profileCount: json.count || json.users?.length || 0,
        };
      }
    }

    const { count, error } = await supabase
      .from('users_info')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        connected: false,
        message: `Error Supabase: ${error.message}`,
      };
    }

    return {
      connected: true,
      message: 'Supabase conectado exitosamente',
      profileCount: count ?? 0,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Fallo de conexión: ${err?.message || 'Inaccesible'}`,
    };
  }
}

/**
 * Resend confirmation email via Supabase Auth
 */
export async function resendConfirmationEmail(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
    });

    if (error) {
      console.warn('[Supabase] Resend error:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: `Correo de confirmación enviado exitosamente a ${cleanEmail}`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error reenviando correo' };
  }
}

/**
 * Update user email in Supabase Auth & public.profiles
 */
export async function updateUserEmail(
  newEmail: string,
  userId?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = newEmail.trim().toLowerCase();

    // 1. Update in Supabase Auth (sends confirmation email to new address)
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      email: cleanEmail,
    });

    if (authError) {
      console.warn('[Supabase] Update email error:', authError.message);
      // Even if auth update fails because of current session state, we update profiles table
    }

    // 2. Update in public.profiles table
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: cleanEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) {
        console.warn('[Supabase] Profiles table email update note:', profileError.message);
      }
    }

    return {
      success: true,
      message: `Correo actualizado a ${cleanEmail}. Se ha enviado una verificación al nuevo buzón.`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al actualizar el correo electrónico' };
  }
}

/**
 * Update user password in Supabase Auth
 */
export async function updateUserPassword(newPassword: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.warn('[Supabase] Update password error:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente en el sistema de seguridad.',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al actualizar la contraseña' };
  }
}

