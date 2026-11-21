'use client';

import React from 'react';
import { X } from 'lucide-react';
import { UserRole, VerificationStatus } from '@/lib/types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newFullName: string;
    setNewFullName: (val: string) => void;
    newEmail: string;
    setNewEmail: (val: string) => void;
    newPhone: string;
    setNewPhone: (val: string) => void;
    newIdNumber: string;
    setNewIdNumber: (val: string) => void;
    newRole: UserRole;
    setNewRole: (val: UserRole) => void;
    newStatus: VerificationStatus;
    setNewStatus: (val: VerificationStatus) => void;
    newVisibleToViewers: boolean;
    setNewVisibleToViewers: (val: boolean) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    newFullName,
    setNewFullName,
    newEmail,
    setNewEmail,
    newPhone,
    setNewPhone,
    newIdNumber,
    setNewIdNumber,
    newRole,
    setNewRole,
    newStatus,
    setNewStatus,
    newVisibleToViewers,
    setNewVisibleToViewers,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
                <div className="bg-[#0e1b29] text-white p-5 flex items-center justify-between border-b-4 border-[#d9251d]">
                    <h3 className="text-base font-bold">Crear Nuevo Usuario</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                            Nombre Completo Legal *
                        </label>
                        <input
                            type="text"
                            required
                            value={newFullName}
                            onChange={(e) => setNewFullName(e.target.value)}
                            placeholder="Ej. Ing. Juan Pérez"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">
                            Correo Electrónico *
                        </label>
                        <input
                            type="email"
                            required
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="usuario@petrolink.com"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Cédula (números) *
                            </label>
                            <input
                                type="text"
                                required
                                value={newIdNumber}
                                onChange={(e) =>
                                    setNewIdNumber(e.target.value.replace(/\D/g, ''))
                                }
                                placeholder="18492043"
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                placeholder="+58 412-1234567"
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Rol Inicial
                            </label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as UserRole)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                            >
                                <option value="client">Cliente</option>
                                <option value="viewer">Visor</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Estado
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) =>
                                    setNewStatus(e.target.value as VerificationStatus)
                                }
                                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                            >
                                <option value="aprobado">Aprobado</option>
                                <option value="pendiente">Pendiente</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="newVisibleToViewers"
                            checked={newVisibleToViewers}
                            onChange={(e) => setNewVisibleToViewers(e.target.checked)}
                            className="rounded text-[#d9251d]"
                        />
                        <label
                            htmlFor="newVisibleToViewers"
                            className="font-semibold text-slate-700 cursor-pointer"
                        >
                            Incluir en la lista visible para Visores
                        </label>
                    </div>

                    <div className="pt-3 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg font-bold cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold rounded-lg shadow cursor-pointer"
                        >
                            Crear Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};