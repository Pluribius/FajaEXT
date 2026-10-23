import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseUserInfoJoined, supabaseJoinedToAppUser } from '@/lib/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// GET: Fetch all users from Supabase with joined relations
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('users_info')
      .select('*, contact_info(*), documents(*), verification_status(*), payment_status(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API Admin Users] Error fetching users_info:', error);
      return NextResponse.json(
        { success: false, error: error.message, users: [] },
        { status: 500 }
      );
    }

    const appUsers = (data || []).map((row: any) =>
      supabaseJoinedToAppUser(row as SupabaseUserInfoJoined)
    );

    return NextResponse.json({
      success: true,
      count: appUsers.length,
      users: appUsers,
    });
  } catch (err: any) {
    console.error('[API Admin Users] Exception in GET:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error', users: [] },
      { status: 500 }
    );
  }
}

// PATCH: Update single or bulk user verification status, role, batch_id
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userIds, status, role, notes, batchId } = body;

    const targetIds: string[] = Array.isArray(userIds)
      ? userIds
      : userId
        ? [userId]
        : [];

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No user ID provided for update' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // 1. Update verification_status if status was specified
    if (status) {
      const dbStatus =
        status === 'aprobado' || status === 'approved'
          ? 'approved'
          : status === 'rechazado' || status === 'rejected'
            ? 'rejected'
            : 'pending';

      const verifiedAt = dbStatus === 'approved' ? new Date().toISOString() : null;

      for (const id of targetIds) {
        await supabase
          .from('verification_status')
          .upsert({
            id,
            status: dbStatus,
            verified_at: verifiedAt,
          });
      }
    }

    // 2. Update role in users_info if specified
    if (role) {
      const dbRole = role === 'admin' ? 'admin' : role === 'viewer' ? 'viewer' : 'user';
      for (const id of targetIds) {
        await supabase
          .from('users_info')
          .update({ role: dbRole as any })
          .eq('id', id);
      }
    }

    // 3. Update payment_status / batch_id if specified
    if (batchId !== undefined) {
      for (const id of targetIds) {
        await supabase
          .from('payment_status')
          .upsert({
            id,
            batch_id: batchId,
          });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: targetIds.length,
    });
  } catch (err: any) {
    console.error('[API Admin Users] Exception in PATCH:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove user
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userIds } = body;
    const targetIds: string[] = Array.isArray(userIds)
      ? userIds
      : userId
        ? [userId]
        : [];

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No user ID provided for deletion' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    for (const id of targetIds) {
      // Delete child relations
      await supabase.from('payment_status').delete().eq('id', id);
      await supabase.from('verification_status').delete().eq('id', id);
      await supabase.from('documents').delete().eq('id', id);
      await supabase.from('contact_info').delete().eq('id', id);
      await supabase.from('users_info').delete().eq('id', id);
      try {
        await supabase.auth.admin.deleteUser(id);
      } catch (authErr) {
        console.warn('Auth user delete note:', authErr);
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: targetIds.length,
    });
  } catch (err: any) {
    console.error('[API Admin Users] Exception in DELETE:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
