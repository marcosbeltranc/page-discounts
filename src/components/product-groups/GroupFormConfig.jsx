'use client';
import { ArrowLeft, X, Loader2 } from 'lucide-react';

export default function CustomerFormConfig({
    view,
    formData,
    setFormData,
    actionLoading,
    onSubmit,
    onCancel,
    onRemoveCustomer // Antes era onRemoveSku
}) {
    return (
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <form onSubmit={onSubmit} className="space-y-5 w-full">
                {/* Header idéntico al de productos */}
                <div className="flex items-center gap-3 mb-2">
                    <button type="button" onClick={onCancel} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl transition-all">
                        <ArrowLeft size={15} />
                    </button>
                    <h2 className="text-sm font-bold text-slate-800">
                        {view === 'add' ? 'Nueva Estructura Manual' : 'Editar Estructura'}
                    </h2>
                </div>

                {/* Campos de Nombre y Tipo */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Nombre Único del Grupo</label>
                    <input
                        type="text"
                        value={formData.group}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        disabled={formData.type === 'auto'}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-mono shadow-inner disabled:opacity-60"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Origen / Comportamiento</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        disabled={view === 'edit'}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                    >
                        <option value="manual">Manual (No se alterará por Sync)</option>
                        <option value="auto">Automático (Sincronizado por Atributos)</option>
                    </select>
                </div>

                {/* Toggle de Activo */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-inner">
                    <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-slate-300 bg-white rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="active" className="text-xs font-bold text-slate-600 cursor-pointer select-none">Grupo activo</label>
                </div>

                {/* Lista de Clientes vinculados */}
                <div className="border-t border-slate-100 pt-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Clientes asignados ({formData.values.length})
                    </label>
                    <div className="min-h-36 bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap gap-1.5 items-start max-h-64 overflow-y-auto custom-scrollbar shadow-inner">
                        {formData.values.map((id, index) => (
                            <div key={index} className="flex items-center gap-1.5 bg-white border border-slate-200 pl-2.5 pr-1 py-0.5 rounded-lg text-[11px] font-mono font-bold text-slate-700 hover:border-rose-300 transition-all shadow-sm">
                                <span>{id}</span>
                                <button type="button" onClick={() => onRemoveCustomer(id)} className="text-slate-400 hover:text-rose-600 p-0.5 rounded">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer de acción */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button type="button" onClick={onCancel} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">Cancelar</button>
                    <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                        {actionLoading && <Loader2 className="animate-spin" size={14} />}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}