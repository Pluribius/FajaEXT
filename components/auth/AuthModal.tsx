'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { DocumentImage } from '@/components/ui/DocumentImage';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    login,
    register,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState(true); // true = V-, false = E-
  const [idNumber, setIdNumber] = useState('');
  const [idPhotoUrl, setIdPhotoUrl] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setIdPhotoUrl(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const useSampleId = (samplePath: string) => {
    setIdPhotoUrl(samplePath);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Credenciales incorrectas');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMsg('El nombre legal completo es requerido.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('El teléfono de contacto es requerido.');
      return;
    }
    // ID number must be digits
    const cleanId = idNumber.replace(/\D/g, '');
    if (!cleanId || cleanId.length < 6) {
      setErrorMsg('El número de documento de identidad debe contener solo dígitos (mínimo 6 números).');
      return;
    }
    if (!idPhotoUrl) {
      setErrorMsg('Debes subir o adjuntar la fotografía de tu documento de identidad / cédula.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      fullName,
      email,
      phone,
      idNumber: cleanId,
      idType,
      idPhotoUrl,
      password,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'No se pudo completar el registro.');
    }
  };

  const quickDemoLogin = (demoEmail: string) => {
    login(demoEmail);
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8"
          >
          {/* Header */}
          <div className="bg-[#0e1b29] text-white p-6 relative border-b-4 border-[#d9251d]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 bg-[#d9251d] rounded-sm" />
                  <span className="text-xs uppercase tracking-widest text-slate-300 font-bold">
                    PetroLink • Portal Corporativo
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  {authModalTab === 'login' ? 'Iniciar Sesión' : 'Registro de Cliente'}
                </h2>
              </div>
              <button
                onClick={closeAuthModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex mt-6 bg-slate-900/60 p-1 rounded-lg border border-slate-700/60">
              <button
                onClick={() => {
                  setErrorMsg(null);
                  openAuthModal('login');
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authModalTab === 'login'
                    ? 'bg-[#d9251d] text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                Acceso al Sistema
              </button>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  openAuthModal('register');
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authModalTab === 'register'
                    ? 'bg-[#d9251d] text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                Registro de Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {authModalTab === 'login' ? (
              <div className="space-y-6">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu-correo@petrolink.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9251d] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9251d] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-sm uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Ingresar al Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <strong className="text-slate-900 block mb-0.5">Requisitos Oficiales de Registro:</strong>
                  Ingresa tus datos gubernamentales reales y adjunta la foto de tu documento para la verificación de seguridad.
                </div>

                {/* Full Government Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre Completo Oficial (Según Cédula) *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Carlos Eduardo Valbuena Mendoza"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Correo Electrónico Válido *
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@dominio.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Teléfono de Contacto *
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+58 414-1234567"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                      />
                    </div>
                  </div>
                </div>

                {/* ID Number in Numbers */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo y Número de Documento de Identidad / Cédula *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={idType ? 'V' : 'E'}
                      onChange={(e) => setIdType(e.target.value === 'V')}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#d9251d] cursor-pointer"
                    >
                      <option value="V">V- (Venezolano)</option>
                      <option value="E">E- (Extranjero)</option>
                    </select>

                    <div className="relative flex-1">
                      <CreditCard className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej. 18492043"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Selecciona V- para nacional o E- para extranjero e ingresa sólo los números.
                  </span>
                </div>

                {/* ID Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Foto del Documento de Identidad / Cédula *
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {idPhotoUrl ? (
                    <div className="p-3 bg-slate-50 border-2 border-emerald-500/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded bg-slate-200 overflow-hidden border border-slate-300 relative">
                          <DocumentImage
                            src={idPhotoUrl}
                            alt="Documento Adjunto"
                            objectFit="cover"
                            showLoadingSpinner={false}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Foto de documento cargada
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Listo para inspección de seguridad
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#d9251d] hover:underline"
                      >
                        Cambiar foto
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-slate-300 hover:border-[#d9251d] bg-slate-50 hover:bg-slate-100/70 rounded-lg cursor-pointer transition-all text-center"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-slate-700">
                        Haz clic para subir foto de tu documento (PNG, JPG)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Asegúrate de que el número y nombre sean legibles
                      </div>
                    </div>
                  )}

                  {/* Sample ID buttons for quick testing */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">¿No tienes foto a mano?</span>
                    <button
                      type="button"
                      onClick={() => useSampleId('/images/formato vacio rif.png')}
                      className="text-[11px] font-semibold text-slate-700 hover:text-[#d9251d] bg-slate-200/80 px-2 py-0.5 rounded transition-colors"
                    >
                      📎 Usar Cédula/RIF de Ejemplo
                    </button>
                    <button
                      type="button"
                      onClick={() => useSampleId('/images/formato vacio banavih.png')}
                      className="text-[11px] font-semibold text-slate-700 hover:text-[#d9251d] bg-slate-200/80 px-2 py-0.5 rounded transition-colors"
                    >
                      📎 Formato Banavih
                    </button>
                  </div>
                </div>

                {/* Password and Confirmation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d9251d]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#d9251d] hover:bg-[#b81c15] text-white font-bold text-sm uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>Registrar Cuenta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
