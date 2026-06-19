'use client';
import { Search, X, Layers, Loader2, Edit2, Trash2 } from 'lucide-react';

export default function GroupListTable({ groups, filteredGroups, loading, searchTerm, setSearchTerm, onEditClick, onDeleteClick }) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="relative flex-1 lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={15} />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar grupo o código de cliente..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 font-semibold shadow-inner focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {loading ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.isArray(filteredGroups) && filteredGroups.map((group) => (
                        <div key={group.id} className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-5 hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-sm text-slate-800">{group.group}</h3>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${group.active ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-slate-100 text-slate-400'}`}>
                                    {group.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 mb-2">Clientes: {group.values?.length || 0}</div>
                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                {group.values?.map(val => (
                                    <span key={val} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600">{val}</span>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                                <button onClick={() => onEditClick(group)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl"><Edit2 size={14} /></button>
                                <button onClick={() => onDeleteClick(group.id)} className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}