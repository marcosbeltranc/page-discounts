'use client';
import { Search, X, BadgePercent, Loader2, Edit2, Trash2, Box } from 'lucide-react';

export default function PromoProductTable({
    promos,
    filteredPromos,
    loading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    onEditClick,
    onDeleteClick
}) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* SEGMENTACIÓN POR TIPO REAL DEL JSON */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Todos ({promos.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('folleto')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'folleto' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                    >
                        Folletos ({promos.filter(p => p.tipo === 'folleto').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('muestra')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'muestra' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
                    >
                        Muestras ({promos.filter(p => p.tipo === 'muestra').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('mercancia')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'mercancia' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-amber-600'}`}
                    >
                        Mercancía ({promos.filter(p => p.tipo === 'mercancia').length})
                    </button>
                </div>

                <div className="relative flex-1 lg:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search size={15} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por SKU o descripción de material..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all font-semibold shadow-inner"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultando inventario de materiales...</p>
                </div>
            ) : filteredPromos.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-white/60 rounded-2xl bg-white/20">
                    <BadgePercent className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 font-bold text-sm">No se encontraron ítems en este segmento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPromos.map((item) => {
                        const isStockLow = item.stock_disponible <= 500;
                        const isItemActive = item.activo === true || item.activo === 1 || item.activo === '1';

                        return (
                            <div
                                key={item.id}
                                className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all group"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <div className="max-w-[70%]">
                                            <h3 className="font-bold text-slate-800 text-sm tracking-tight line-clamp-2 group-hover:text-amber-600 transition-colors">
                                                {item.nombre}
                                            </h3>
                                            <span className="font-mono text-[11px] font-bold text-indigo-600 uppercase block mt-1">
                                                {item.sku}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${item.tipo === 'folleto' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                item.tipo === 'muestra' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {item.tipo}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${isItemActive ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-slate-100 text-slate-400'}`}>
                                                {isItemActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* INDICADOR DE INVENTARIO */}
                                    <div className={`border rounded-xl p-3 my-4 flex items-center justify-between shadow-inner ${isStockLow ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-100'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <Box size={14} className={isStockLow ? 'text-rose-500' : 'text-slate-400'} />
                                            <span className="text-xs font-bold text-slate-500">Disponibilidad:</span>
                                        </div>
                                        <span className={`font-mono text-sm font-bold ${isStockLow ? 'text-rose-600' : 'text-slate-800'}`}>
                                            {item.stock_disponible.toLocaleString()} pzas
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button onClick={() => onEditClick(item)} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all active:scale-95">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => onDeleteClick(item.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all active:scale-95">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}