'use client';
import { ArrowLeft, X, Loader2 } from 'lucide-react';

// Declaración correcta de los parámetros (props)
export default function GroupFormConfig({
    view,
    formData,
    setFormData,
    actionLoading,
    onSubmit,
    onCancel,
    onRemoveCustomer
}) {
    return (
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 shadow-md">
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onCancel} className="p-2 bg-slate-50 border rounded-xl"><ArrowLeft size={15} /></button>
                    <h2 className="text-sm font-bold">{view === 'add' ? 'Nuevo Grupo' : 'Editar Grupo'}</h2>
                </div>

                <input
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono shadow-inner"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    placeholder="Nombre del grupo"
                />

                {/* TABLA DE CLIENTES ASIGNADOS */}
                <div className="border-t border-slate-100 pt-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Clientes asignados ({formData.values?.length || 0})
                    </label>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl bg-white shadow-inner">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 font-bold text-slate-500">Código</th>
                                    <th className="px-3 py-2 font-bold text-slate-500 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!formData.values || formData.values.length === 0) ? (
                                    <tr>
                                        <td colSpan="2" className="px-3 py-4 text-center text-slate-400 italic">No hay clientes vinculados.</td>
                                    </tr>
                                ) : (
                                    formData.values.map((id) => (
                                        <tr key={`row-${id}`} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 font-mono font-bold text-slate-700">{id}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveCustomer(id)}
                                                    className="text-rose-500 hover:text-rose-700 p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-500">
                    {actionLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
}