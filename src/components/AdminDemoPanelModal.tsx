import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserPlus, Clock, Lock, Unlock, Trash2, 
  Copy, Check, AlertCircle, Sparkles, RefreshCw, Key,
  Building, Mail, Calendar, Phone, ExternalLink, X
} from 'lucide-react';
import { DemoAccount } from '../types';
import { 
  getDemoAccounts, 
  saveDemoAccount, 
  updateDemoAccount, 
  deleteDemoAccount,
  subscribeDemoAccounts 
} from '../lib/firebase';

interface AdminDemoPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdminEmail?: string;
}

export function AdminDemoPanelModal({
  isOpen,
  onClose,
  currentAdminEmail = 'jpz1207uy@gmail.com',
}: AdminDemoPanelModalProps) {
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for creating new client demo
  const [clienteNombre, setClienteNombre] = useState('');
  const [negocioNombre, setNegocioNombre] = useState('');
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('demo123');
  const [duracionHoras, setDuracionHoras] = useState<number>(24);
  const [notas, setNotas] = useState('');
  const [formError, setFormError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const unsub = subscribeDemoAccounts((list) => {
      setAccounts(list);
      setLoading(false);
    });

    return () => unsub();
  }, [isOpen]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setActionSuccess('');

    if (!clienteNombre.trim()) {
      setFormError('El nombre del cliente es obligatorio.');
      return;
    }
    if (!emailOrUser.trim()) {
      setFormError('El correo o usuario es obligatorio.');
      return;
    }

    const newAcc: DemoAccount = {
      id: `demo_${Date.now()}`,
      clienteNombre: clienteNombre.trim(),
      negocioNombre: negocioNombre.trim() || undefined,
      emailOrUser: emailOrUser.trim().toLowerCase(),
      password: password.trim() || undefined,
      duracionHoras,
      creadoTimestamp: Date.now(),
      estado: duracionHoras === 0 ? 'ilimitado' : 'activo',
      creadoPor: currentAdminEmail,
      notas: notas.trim() || undefined,
      totalIngresos: 0,
    };

    const res = await saveDemoAccount(newAcc);
    if (res.success) {
      setActionSuccess(`¡Acceso demo creado exitosamente para "${clienteNombre}"!`);
      setClienteNombre('');
      setNegocioNombre('');
      setEmailOrUser('');
      setPassword('demo123');
      setDuracionHoras(24);
      setNotas('');
      setShowCreateForm(false);
    } else {
      setFormError(res.error || 'Error al guardar el acceso demo.');
    }
  };

  const handleExtendHours = async (acc: DemoAccount, hoursToAdd: number = 24) => {
    const now = Date.now();
    const currentExpiry = acc.expiraTimestamp && acc.expiraTimestamp > now ? acc.expiraTimestamp : now;
    const newExpiry = currentExpiry + (hoursToAdd * 3600 * 1000);

    await updateDemoAccount(acc.id, {
      expiraTimestamp: newExpiry,
      estado: 'activo',
      duracionHoras: (acc.duracionHoras || 24) + hoursToAdd,
    });
    setActionSuccess(`Se agregaron +${hoursToAdd}h al cliente ${acc.clienteNombre}.`);
  };

  const handleToggleBlock = async (acc: DemoAccount) => {
    const newStatus = acc.estado === 'bloqueado' ? 'activo' : 'bloqueado';
    await updateDemoAccount(acc.id, { estado: newStatus });
    setActionSuccess(`Acceso ${newStatus === 'bloqueado' ? 'bloqueado' : 'desbloqueado'} para ${acc.clienteNombre}.`);
  };

  const handleSetUnlimited = async (acc: DemoAccount) => {
    await updateDemoAccount(acc.id, {
      estado: 'ilimitado',
      duracionHoras: 0,
      expiraTimestamp: Date.now() + (365 * 24 * 3600 * 1000),
    });
    setActionSuccess(`¡Licencia Permanente Ilimitada otorgada a ${acc.clienteNombre}!`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el acceso demo de "${name}"?`)) {
      await deleteDemoAccount(id);
      setActionSuccess(`Acceso demo de ${name} eliminado.`);
    }
  };

  const copyClientCredentialsToClipboard = (acc: DemoAccount) => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nextcrm.uy';
    const text = `🍕 *TUS ACCESOS A NEXTCRM PIZZERÍA DEMO (24 HORAS)*\n\n` +
      `¡Hola ${acc.clienteNombre}! Ya tienes habilitado tu acceso exclusivo al sistema POS & CRM para pizzerías:\n\n` +
      `🔗 *Enlace de Ingreso:* ${appUrl}\n` +
      `👤 *Usuario / Correo:* ${acc.emailOrUser}\n` +
      `🔑 *Contraseña:* ${acc.password || 'demo123'}\n` +
      `⏳ *Validez:* ${acc.duracionHoras > 0 ? `${acc.duracionHoras} Horas desde tu primer inicio de sesión` : 'Ilimitado'}\n\n` +
      `Cualquier consulta o para activar tu licencia definitiva, comunícate con nosotros por este medio.`;

    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900/60 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Panel de Control: Accesos & Licencias Demo</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN MASTER ({currentAdminEmail})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea credenciales para clientes, gestiona el tiempo de 24h restante y bloquea accesos expirados.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action feedback */}
        {actionSuccess && (
          <div className="bg-emerald-950/70 border-b border-emerald-500/30 text-emerald-300 px-6 py-2.5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Top Bar Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">
                Total Clientes Registrados: <strong className="text-white text-sm">{accounts.length}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400">
                Activos: <strong className="text-emerald-400">{accounts.filter(a => a.estado === 'activo' || a.estado === 'ilimitado').length}</strong>
              </span>
            </div>

            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer"
            >
              <UserPlus size={15} />
              <span>{showCreateForm ? 'Cerrar Formulario' : '+ Crear Nuevo Acceso para Cliente'}</span>
            </button>
          </div>

          {/* Create New Demo Account Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateAccount} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Sparkles size={14} /> Nueva Cuenta de Prueba para Cliente
              </h3>

              {formError && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Gómez"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Nombre del Local / Pizzería
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pizzería Del Bosque"
                    value={negocioNombre}
                    onChange={(e) => setNegocioNombre(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Correo o Usuario de Ingreso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: cliente@pizzeria.com o 'pizzeria1'"
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Contraseña Asignada
                  </label>
                  <input
                    type="text"
                    placeholder="demo123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Duración de Prueba
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '24 Horas', val: 24 },
                      { label: '48 Horas', val: 48 },
                      { label: '7 Días', val: 168 },
                      { label: 'Ilimitado', val: 0 },
                    ].map((dur) => (
                      <button
                        type="button"
                        key={dur.val}
                        onClick={() => setDuracionHoras(dur.val)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          duracionHoras === dur.val
                            ? 'bg-blue-600 text-white border border-blue-400 shadow-sm'
                            : 'bg-black/30 text-slate-400 border border-white/5 hover:border-white/20'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Notas o Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Contactado por Instagram / Quiere delivery y KDS"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check size={14} /> Guardar y Habilitar Acceso
                </button>
              </div>
            </form>
          )}

          {/* Accounts List Table */}
          <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Cliente / Pizzería</th>
                    <th className="py-3.5 px-4">Usuario & Clave</th>
                    <th className="py-3.5 px-4">Duración & Estado</th>
                    <th className="py-3.5 px-4">Tiempo Restante</th>
                    <th className="py-3.5 px-4">Ingresos</th>
                    <th className="py-3.5 px-4 text-right">Acciones de Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-light">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Cargando cuentas demo desde Firebase...
                      </td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No hay cuentas demo creadas aún. Haz clic en <strong>+ Crear Nuevo Acceso</strong> para otorgar 24h a un cliente.
                      </td>
                    </tr>
                  ) : (
                    accounts.map((acc) => {
                      const now = Date.now();
                      const isExpired = acc.duracionHoras > 0 && acc.expiraTimestamp && now > acc.expiraTimestamp;
                      const isActivated = !!acc.activadoTimestamp;
                      
                      let remainingText = 'No iniciado (inicia al primer login)';
                      if (acc.estado === 'ilimitado' || acc.duracionHoras === 0) {
                        remainingText = 'Ilimitado (Permanente)';
                      } else if (isActivated && acc.expiraTimestamp) {
                        if (isExpired) {
                          remainingText = 'EXPIRADO (Bloqueado)';
                        } else {
                          const diffMs = acc.expiraTimestamp - now;
                          const hrs = Math.floor(diffMs / (3600 * 1000));
                          const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
                          remainingText = `${hrs}h ${mins}m restantes`;
                        }
                      }

                      return (
                        <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                          {/* Name / Business */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{acc.clienteNombre}</div>
                            {acc.negocioNombre && (
                              <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5">
                                <Building size={11} /> {acc.negocioNombre}
                              </div>
                            )}
                            {acc.notas && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-[200px] truncate">
                                {acc.notas}
                              </div>
                            )}
                          </td>

                          {/* Credentials */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs text-slate-200">{acc.emailOrUser}</div>
                            <div className="text-[11px] text-amber-400/80 font-mono mt-0.5 flex items-center gap-1">
                              <Key size={10} /> {acc.password || 'Sin contraseña'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {acc.estado === 'bloqueado' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                  Bloqueado
                                </span>
                              ) : isExpired ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                  Expirado
                                </span>
                              ) : acc.estado === 'ilimitado' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Oficial / Ilimitado
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  Demo {acc.duracionHoras}h
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Remaining */}
                          <td className="py-3.5 px-4">
                            <span className={`text-[11px] font-medium ${
                              isExpired || acc.estado === 'bloqueado'
                                ? 'text-red-400' 
                                : acc.estado === 'ilimitado'
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}>
                              {remainingText}
                            </span>
                          </td>

                          {/* Logins */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-slate-300">{acc.totalIngresos || 0} veces</span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Copy info for WhatsApp */}
                              <button
                                onClick={() => copyClientCredentialsToClipboard(acc)}
                                title="Copiar datos de acceso para enviar por WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                              >
                                {copiedId === acc.id ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                              </button>

                              {/* Extend 24h */}
                              <button
                                onClick={() => handleExtendHours(acc, 24)}
                                title="Extender +24 Horas"
                                className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 text-[10px] font-semibold transition-all cursor-pointer"
                              >
                                +24h
                              </button>

                              {/* Make Unlimited */}
                              {acc.estado !== 'ilimitado' && (
                                <button
                                  onClick={() => handleSetUnlimited(acc)}
                                  title="Otorgar Licencia Permanente (Ilimitado)"
                                  className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 text-[10px] font-semibold transition-all cursor-pointer"
                                >
                                  Ilimitado
                                </button>
                              )}

                              {/* Lock / Unlock */}
                              <button
                                onClick={() => handleToggleBlock(acc)}
                                title={acc.estado === 'bloqueado' ? 'Desbloquear cuenta' : 'Bloquear acceso'}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  acc.estado === 'bloqueado'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                                }`}
                              >
                                {acc.estado === 'bloqueado' ? <Unlock size={13} /> : <Lock size={13} />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(acc.id, acc.clienteNombre)}
                                title="Eliminar cuenta"
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-1.5">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
              <ShieldCheck size={14} /> ¿Cómo funciona el Acceso Restringido a Clientes?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              1. Tú como Administrador (<span className="text-white font-mono">{currentAdminEmail}</span>) puedes entrar directamente a cualquier hora sin límite.
            </p>
            <p className="text-slate-400 leading-relaxed">
              2. Cada cliente recibe un usuario y contraseña creado por ti.
            </p>
            <p className="text-slate-400 leading-relaxed">
              3. El reloj de 24 horas comienza cuando el cliente inicia sesión por primera vez. Cada vez que entra, el sistema calcula el tiempo restante y lo bloquea automáticamente al expirar.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
}
