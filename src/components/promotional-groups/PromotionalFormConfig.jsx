'use client';
import { ArrowLeft, X, Loader2 } from 'lucide-react';

export default function PromotionalFormConfig({ view, formData, setFormData, actionLoading, onSubmit, onCancel, onRemoveProduct }) {
    return (
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-sm border rounded-2xl p-6 shadow-md">
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onCancel} className="p-2 bg-slate-50 border rounded-xl"><ArrowLeft size={15} /></button>
                    <h2 className="text-sm font-bold">{view === 'add' ? 'Nuevo Grupo Promo' : 'Editar Grupo Promo'}</h2>
                </div>
                <input
                    className="w-full border rounded-xl px-3 py-2.5 text-xs font-mono"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    placeholder="Nombre del grupo"
                />
                <div className="border-t pt-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Productos asignados</label>
                    <div className="max-h-64 overflow-y-auto border rounded-xl mt-2">
                        {formData.values.map(sku => (
                            <div key={sku} className="flex justify-between p-3 border-b text-xs font-mono">
                                {sku}
                                <button type="button" onClick={() => onRemoveProduct(sku)} className="text-rose-500"><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold">
                    {actionLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
}