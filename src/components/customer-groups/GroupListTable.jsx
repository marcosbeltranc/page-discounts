'use client';
import { Search, X, Users, Edit2, Trash2 } from 'lucide-react';

export default function CustomerListTable({
    groups, filteredGroups, loading, searchTerm, setSearchTerm,
    activeTab, setActiveTab, onEditClick, onDeleteClick
}) {
    return (
        <div className="space-y-6">
            {/* Filtros y Buscador */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {['all', 'manual', 'auto'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({groups.filter(g => tab === 'all' || g.type === tab).length})
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 lg:max-w-md">
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar grupo o código de cliente..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold shadow-inner focus:outline-indigo-500" />
                </div>
            </div>

            {/* Grid de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGroups.map((group) => (
                    <div key={group.id} className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-5 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-slate-800 text-sm">{group.group}</h3>
                            <div className="flex gap-1">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${group.type === 'auto' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>{group.type}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${group.active ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>{group.active ? 'Activo' : 'Inactivo'}</span>
                            </div>
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 mb-2">Clientes incluidos: {group.values?.length || 0}</div>


                        {/* Contenedor de IDs de Clientes */}
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                            {Array.isArray(group.values) && group.values.length > 0 ? (
                                group.values.map((id, idx) => {
                                    // Lógica opcional para resaltar si coincide con el término de búsqueda
                                    const isMatch = searchTerm && id?.toLowerCase().includes(searchTerm.trim().toLowerCase());

                                    return (
                                        <span
                                            key={`${group.id}-client-${idx}`}
                                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all border ${isMatch
                                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm scale-105'
                                                : 'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}
                                        >
                                            {id}
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-[10px] text-slate-400 italic font-medium">Sin clientes asignados</span>
                            )}
                        </div>

                        {group.type !== 'auto' && (
                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                                <button onClick={() => onEditClick(group)} className="p-2 bg-slate-50 rounded-xl"><Edit2 size={14} /></button>
                                <button onClick={() => onDeleteClick(group.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={14} /></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}