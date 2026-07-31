'use client';

import { ArrowLeft, Loader2, X } from 'lucide-react';

export default function ProductFormConfig({
    view,
    formData,
    setFormData,
    actionLoading,
    onSubmit,
    onCancel,
    onRemoveSku
}) {
    return (
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <form onSubmit={onSubmit} className="space-y-5 w-full">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl transition-all"
                    >
                        <ArrowLeft size={15} />
                    </button>

                    <h2 className="text-sm font-bold text-slate-800">
                        {view === 'add'
                            ? 'Nueva estructura manual'
                            : 'Editar estructura'}
                    </h2>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Nombre del grupo
                    </label>

                    <input
                        type="text"
                        value={formData.group}
                        onChange={(event) => setFormData({
                            ...formData,
                            group: event.target.value
                        })}
                        disabled={formData.type === 'auto'}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-inner disabled:opacity-60"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Origen / comportamiento
                    </label>

                    <select
                        value={formData.type}
                        onChange={(event) => setFormData({
                            ...formData,
                            type: event.target.value
                        })}
                        disabled={view === 'edit'}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                    >
                        <option value="manual">
                            Manual (no se alterará por sincronización)
                        </option>
                        <option value="auto">
                            Automático (sincronizado por atributos)
                        </option>
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-inner">
                    <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(event) => setFormData({
                            ...formData,
                            active: event.target.checked
                        })}
                        className="w-4 h-4 text-indigo-600 border-slate-300 bg-white rounded focus:ring-indigo-500 cursor-pointer"
                    />

                    <label
                        htmlFor="active"
                        className="text-xs font-bold text-slate-600 cursor-pointer select-none"
                    >
                        Grupo activo
                    </label>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Productos seleccionados
                        </label>

                        <span className="text-[10px] font-bold text-indigo-600">
                            {formData.values.length} SKUs
                        </span>
                    </div>

                    <div className="min-h-36 bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap gap-1.5 items-start max-h-64 overflow-y-auto custom-scrollbar shadow-inner">
                        {formData.values.length === 0 ? (
                            <span className="text-xs text-slate-400 font-medium italic m-auto text-center">
                                Usa el selector para incluir productos.
                            </span>
                        ) : (
                            formData.values.map((sku) => (
                                <div
                                    key={sku}
                                    className="flex items-center gap-1.5 bg-white border border-slate-200 pl-2.5 pr-1 py-0.5 rounded-lg text-[11px] font-mono font-bold text-slate-700 hover:border-rose-300 transition-all shadow-sm"
                                >
                                    <span>{sku}</span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveSku(sku)}
                                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                                        aria-label={`Quitar ${sku}`}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                        {actionLoading && (
                            <Loader2 className="animate-spin" size={14} />
                        )}
                        Guardar cambios
                    </button>
                </div>
            </form>
        </div>
    );
}
