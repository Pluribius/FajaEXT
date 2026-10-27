'use client';

import React from 'react';
import { X } from 'lucide-react';
import { AppUser, UserRole, VerificationStatus } from '@/lib/types';

interface EditUserModalProps {
    editingUser: AppUser;
    setEditingUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
    onSave: (e: React.FormEvent) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    editingUser,
    setEditingUser,
    onSave,
}) => {
    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
                <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
                    <h3 className="text-base font-bold">Editar Usuario</h3>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-4 text-xs">
                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            value={editingUser.fullName}
                            onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Correo</label>
                        <input
                            type="email"
                            required
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Tipo de Cédula</label>
                            <select
                                value={editingUser.idType === false ? 'false' : 'true'}
                                onChange={(e) =>
                                    setEditingUser({
                                        ...editingUser,
                                        idType: e.target.value === 'true',
                                    })
                                }
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                            >
                                <option value="true">V- (Venezolano)</option>
                                <option value="false">E- (Extranjero)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Número de Cédula</label>
                            <input
                                type="text"
                                required
                                value={editingUser.idNumber}
                                onChange={(e) =>
                                    setEditingUser({
                                        ...editingUser,
                                        idNumber: e.target.value.replace(/\D/g, ''),
                                    })
                                }
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={editingUser.phone}
                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Rol</label>
                            <select
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                            >
                                <option value="client">Cliente</option>
                                <option value="viewer">Visor</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Estatus</label>
                            <select
                                value={editingUser.status}
                                onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as VerificationStatus })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                            >
                                <option value="aprobado">Aprobado</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="rechazado">Rechazado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="visibleToViewersEdit"
                            checked={editingUser.visibleToViewers}
                            onChange={(e) => setEditingUser({ ...editingUser, visibleToViewers: e.target.checked })}
                            className="rounded text-[#d9251d]"
                        />
                        <label htmlFor="visibleToViewersEdit" className="font-semibold text-slate-700">
                            Visible en la lista para Visores / Auditores
                        </label>
                    </div>

                    <div className="pt-3 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 border border-slate-300 rounded-lg font-bold"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold rounded-lg shadow">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};