import { resolveDocumentImageUrl } from './documentUtils';

export type UserRole = 'client' | 'admin' | 'viewer';
export type VerificationStatus = 'aprobado' | 'pendiente' | 'rechazado';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string; // Documento de identidad / Cédula (números)
  idPhotoUrl: string; // Foto del documento subido
  password?: string;
  role: UserRole;
  status: VerificationStatus;
  visibleToViewers: boolean;
  batchId?: string;
  idType?: boolean; // true = Venezolana (V-), false = Extranjero (E-)
  createdAt: string;
  verifiedAt?: string;
  notes?: string;
}

export function formatIdNumber(user: { idNumber?: string; idType?: boolean } | null | undefined): string {
  if (!user || !user.idNumber) return '';
  const prefix = user.idType === false ? 'E-' : 'V-';
  return `${prefix}${user.idNumber}`;
}

export interface SupabaseProfile {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone?: string | null;
  id_document_url?: string | null;
  verification_status: string;
  batch_id?: string | null;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  ID_Type?: boolean;
}

export interface SupabaseUserInfoJoined {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  role: string;
  created_at: string;
  ID_Type?: boolean;
  contact_info?: {
    id: string;
    email: string;
    phone?: string | null;
  } | null;
  documents?: {
    id: string;
    id_document_url: string;
  } | null;
  verification_status?: {
    id: string;
    status: string;
    verified_at?: string | null;
    verified_by?: string | null;
  } | null;
  payment_status?: {
    id: string;
    status: string;
    batch_id?: string | null;
  } | null;
}

export function supabaseJoinedToAppUser(row: SupabaseUserInfoJoined): AppUser {
  const normStatus = (row.verification_status?.status || 'pending').toLowerCase();
  const status: VerificationStatus =
    normStatus === 'aprobado' || normStatus === 'approved' || normStatus === 'verified'
      ? 'aprobado'
      : normStatus === 'rechazado' || normStatus === 'rejected'
      ? 'rechazado'
      : 'pendiente';

  const email = row.contact_info?.email || '';
  const emailLower = email.toLowerCase();
  let role: UserRole = 'client';
  if (row.role === 'admin' || emailLower.includes('admin')) {
    role = 'admin';
  } else if (row.role === 'viewer' || emailLower.includes('visor') || emailLower.includes('auditor')) {
    role = 'viewer';
  }

  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || email || 'Usuario';
  const phone = row.contact_info?.phone || '';
  const rawDoc = row.documents?.id_document_url;
  const idPhotoUrl = resolveDocumentImageUrl(rawDoc);
  const batchId = row.payment_status?.batch_id || undefined;
  const idType = row.ID_Type !== undefined ? row.ID_Type : true;

  return {
    id: row.id,
    fullName,
    email,
    phone,
    idNumber: row.id_number || '',
    idPhotoUrl,
    role,
    status,
    visibleToViewers: status === 'aprobado',
    batchId,
    idType,
    createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    verifiedAt: row.verification_status?.verified_at ? row.verification_status.verified_at.split('T')[0] : undefined,
    notes: batchId ? `Lote asignado: ${batchId}` : undefined,
  };
}

export function profileToAppUser(profile: SupabaseProfile, defaultRole: UserRole = 'client'): AppUser {
  const normStatus = (profile.verification_status || '').toLowerCase();
  const status: VerificationStatus =
    normStatus === 'aprobado' || normStatus === 'approved' || normStatus === 'verified'
      ? 'aprobado'
      : normStatus === 'rechazado' || normStatus === 'rejected'
      ? 'rechazado'
      : 'pendiente';

  // Role detection
  let role: UserRole = defaultRole;
  const emailLower = (profile.email || '').toLowerCase();
  if (emailLower.includes('admin')) {
    role = 'admin';
  } else if (emailLower.includes('visor') || emailLower.includes('auditor')) {
    role = 'viewer';
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || profile.email;
  const idType = profile.ID_Type !== undefined ? profile.ID_Type : true;

  return {
    id: profile.id,
    fullName,
    email: profile.email,
    phone: profile.phone || '',
    idNumber: profile.id_number,
    idPhotoUrl: resolveDocumentImageUrl(profile.id_document_url),
    role,
    status,
    visibleToViewers: status === 'aprobado',
    batchId: profile.batch_id || undefined,
    idType,
    createdAt: profile.created_at ? profile.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    verifiedAt: profile.verified_at ? profile.verified_at.split('T')[0] : undefined,
    notes: profile.batch_id ? `Lote asignado: ${profile.batch_id}` : undefined,
  };
}

export function getUserUID(u: { id?: string; idNumber?: string; email?: string; batchId?: string } | null | undefined): string {
  if (!u) return 'REF-AUD-000000';
  if (u.batchId && u.batchId.trim()) {
    return u.batchId.trim();
  }
  let hash = 0;
  const str = `UID-${u.id || ''}-${u.idNumber || u.email || ''}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = (Math.abs(hash) % 900000) + 100000;
  return `REF-AUD-${positive}`;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'Técnico' | 'Documentación' | 'Operaciones' | 'Facturación' | 'Otro';
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  message: string;
  status: 'Abierto' | 'En Proceso' | 'Resuelto';
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface NewsPost {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  date: string;
  imageUrl?: string;
  author: string;
  important?: boolean;
}
