'use client';
import { ArrowLeft, Loader2, Layers, Box } from 'lucide-react';

export default function PromoProductForm({
    view,
    formData,
    setFormData,
    actionLoading,
    onSubmit,
    onCancel
}) {
    return (
        <div className="lg:col-span-5 w-full bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <form onSubmit={onSubmit} className="space-y-5 w-full">
                <div className="flex items-center gap-3 mb-2">
                    <button type="button" onClick={onCancel} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl transition-all">
                        <ArrowLeft size={15} />
                    </button>
                    <h2 className="text-sm font-bold text-slate-800">
                        {view === 'add' ? 'Alta de Nuevo Material POP' : 'Editar Propiedades de Material'}
                    </h2>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Código SKU Único</label>
                    <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                        placeholder="Ej: FOL-EUCERIN-05"
                        disabled={view === 'edit'}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all shadow-inner disabled:opacity-60"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Descripción Completa del Material</label>
                    <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Folleto Dermatológico con Muestra Integradora"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Clasificación / Tipo</label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shadow-sm"
                        >
                            <option value="folleto">Folleto Informativo</option>
                            <option value="muestra">Muestra Médica</option>
                            <option value="mercancia">Mercancía Corporativa</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Existencia Inicial / Stock</label>
                        <div className="relative">
                            <input
                                type="number"
                                // value={formData.stock_disponible}
                                value={formData.stock_disponible === 0 ? '' : formData.stock_disponible}
                                onChange={(e) => setFormData({ ...formData, stock_disponible: parseInt(e.target.value) || 0 })}
                                placeholder="1"
                                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-inner"
                                required
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Box size={13} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-inner">
                    <input
                        id="activo"
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-4 h-4 text-amber-600 border-slate-300 bg-white rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="activo" className="text-xs font-bold text-slate-600 cursor-pointer select-none">Activo</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button type="button" onClick={onCancel} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95">
                        Cancelar
                    </button>
                    <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-100 transition-all disabled:opacity-50 active:scale-95">
                        {actionLoading && <Loader2 className="animate-spin" size={14} />}
                        {view === 'add' ? 'Dar de Alta' : 'Consolidar Edición'}
                    </button>
                </div>
            </form>
        </div>
    );
}