'use client';
import { Search, Check } from 'lucide-react';

export default function ProductCatalogSelector({ catalogSearch, setCatalogSearch, filteredProducts, addedIds, onSelectProduct }) {
    return (
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-sm border rounded-2xl p-6 shadow-md space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                <input
                    className="w-full bg-white border rounded-xl pl-9 py-2.5 text-xs font-semibold shadow-inner"
                    placeholder="Buscar productos (SKU o nombre)..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                />
            </div>

            <div className="h-[400px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {filteredProducts.map(p => (
                    // Asegúrate de usar p.id como key
                    <div key={p.id} className="flex justify-between items-center p-3 bg-white border rounded-lg text-xs hover:border-indigo-200 transition-all">
                        <div>
                            {/* Aquí usamos los campos correctos del JSON: nombre y sku */}
                            <p className="font-bold text-slate-800">{p.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                        </div>
                        <button
                            onClick={() => onSelectProduct(p.sku)}
                            className={`p-2 rounded-lg ${addedIds.includes(p.sku) ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}
                        >
                            <Check size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}