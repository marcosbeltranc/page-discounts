'use client';
import { Search, X, SlidersHorizontal, Eye } from 'lucide-react';

export default function ProductFilters({
    searchTerm,
    setSearchTerm,
    selectedBrand,
    setSelectedBrand,
    selectedStatus,
    setSelectedStatus,
    brandsList,
    totalCount
}) {
    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm">

            {/* Buscador de Entrada Libre */}
            <div className="relative flex-1 max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por Descripción, Código SAP, SKU o Laboratorio..."
                    className="w-full bg-white/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold shadow-inner"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Selectores y Segmentación */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Dropdown Marcas */}
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <SlidersHorizontal size={12} /> Marca:
                    </span>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="all">Todas ({totalCount})</option>
                        {brandsList.map((brand) => brand !== 'all' && (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                {/* Dropdown Estatus */}
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Eye size={12} /> Estado:
                    </span>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                </div>
            </div>
        </div>
    );
}