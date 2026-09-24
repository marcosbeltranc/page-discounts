'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { UserPlus, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export default function UserHeader({ onRefresh, loading, editingUser, setEditingUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    // Si seleccionan un usuario para editar, abrimos el formulario y rellenamos los datos
    useEffect(() => {
        if (editingUser) {
            setForm({ name: editingUser.name, email: editingUser.email, password: '' });
            setIsOpen(true);
        }
    }, [editingUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Petición para actualizar (PUT)
                const res = await api.put(`/users/update/${editingUser.id}`, form);
                if (res.error !== true) {
                    toast.success('Usuario actualizado correctamente.');
                    handleClose();
                    onRefresh();
                } else {
                    toast.error('No se pudo actualizar el usuario.');
                }
            } else {
                // Petición para crear (POST)
                const res = await api.post('/users/create', form);
                if (res.error !== true) {
                    toast.success('Usuario creado correctamente.');
                    handleClose();
                    onRefresh();
                } else {
                    toast.error('No se pudo crear el usuario.');
                }
            }
        } catch (error) {
            toast.error('Error al procesar la solicitud.');
        }
    };

    const handleClose = () => {
        setForm({ name: '', email: '', password: '' });
        setIsOpen(false);
        if (editingUser) setEditingUser(null);
    };

    return (
        <div className="flex flex-col gap-4 pb-5">
            <div className="space-y-6">
                <div className="flex justify-end">
                    {/* <h1 className="text-2xl font-bold">Promociones</h1> */}
                    <button
                        onClick={() => { setIsOpen(!isOpen); if (editingUser) setEditingUser(null); }}
                        className="px-5 py-3 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                        + Nuevo Usuario
                    </button>
                </div>

            </div>
            {/* <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Módulo de Administradores</h1>
                    <p className="text-xs text-slate-500">Gestión de accesos y usuarios con privilegios.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onRefresh} className="p-2.5 border rounded-xl hover:bg-slate-50 bg-white">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => { setIsOpen(!isOpen); if (editingUser) setEditingUser(null); }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                        <UserPlus size={14} />
                        {isOpen && !editingUser ? 'Cancelar' : 'Nuevo Usuario'}
                    </button>
                </div>
            </div> */}

            {isOpen && (
                <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-end relative">
                    {editingUser && (
                        <div className="absolute top-2 right-4 text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold">
                            Editando ID: {editingUser.id}
                        </div>
                    )}
                    <div className="w-full sm:flex-1">
                        <label className="text-[10px] font-bold text-slate-500">Nombre</label>
                        <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" placeholder="Nombre completo" />
                    </div>
                    <div className="w-full sm:flex-1">
                        <label className="text-[10px] font-bold text-slate-500">Correo Electrónico</label>
                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" placeholder="correo@dominio.com" />
                    </div>
                    <div className="w-full sm:flex-1">
                        <label className="text-[10px] font-bold text-slate-500">
                            Contraseña {editingUser && <span className="font-normal text-slate-400">(Opcional)</span>}
                        </label>
                        <input type="password" required={!editingUser} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" placeholder="••••••••" />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button type="submit" className="flex-1 sm:flex-initial bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800">
                            {editingUser ? 'Actualizar' : 'Guardar'}
                        </button>
                        <button type="button" onClick={handleClose} className="px-3 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50">
                            <X size={14} />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}