'use client';
import { Search, MapPin, CreditCard } from 'lucide-react';

export default function CustomerFilters({ searchTerm, setSearchTerm, totalCount }) {
    return (
        <div className="bg-white/60 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por Nombre, RFC o Código..."
                    className="w-full bg-white/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold shadow-inner"
                />
            </div>
            {/* Puedes agregar selects aquí para filtrar por zona_cliente o credito */}
        </div>
    );
}