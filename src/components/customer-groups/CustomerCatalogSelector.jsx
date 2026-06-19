'use client';
import { Search, X, Check } from 'lucide-react';

export default function CustomerCatalogSelector({ catalogSearch, setCatalogSearch, filteredCustomers, addedIds, onSelectCustomer }) {
    return (
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-sm border rounded-2xl p-6 shadow-md space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                <input
                    className="w-full bg-white border rounded-xl pl-9 py-2.5 text-xs font-semibold shadow-inner"
                    placeholder="Buscar clientes..."
                    onChange={(e) => setCatalogSearch(e.target.value)}
                />
            </div>
            <div className="h-[400px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {filteredCustomers.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-white border rounded-lg text-xs hover:border-indigo-200 transition-all">
                        <div>
                            <p className="font-bold text-slate-800">{c.nombre_cliente}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{c.codigo_cliente}</p>
                        </div>
                        <button
                            onClick={() => onSelectCustomer(c.codigo_cliente)}
                            className={`p-2 rounded-lg ${addedIds.includes(c.codigo_cliente) ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}
                        >
                            <Check size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}