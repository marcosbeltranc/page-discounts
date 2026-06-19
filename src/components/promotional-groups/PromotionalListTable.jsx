'use client';
import { Search, Edit2, Trash2, Loader2 } from 'lucide-react';

export default function PromotionalListTable({ groups, loading, searchTerm, setSearchTerm, onEditClick, onDeleteClick }) {
    return (
        <div className="space-y-6">
            <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
                <input
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 py-2.5 text-xs font-semibold shadow-inner"
                    placeholder="Buscar grupo o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {groups.map((g) => (
                        <div key={g.id} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                            <h3 className="font-bold text-sm">{g.group}</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Productos: {g.values?.length || 0}</p>
                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                                <button onClick={() => onEditClick(g)} className="p-2 bg-slate-50 rounded-xl"><Edit2 size={14} /></button>
                                <button onClick={() => onDeleteClick(g.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}