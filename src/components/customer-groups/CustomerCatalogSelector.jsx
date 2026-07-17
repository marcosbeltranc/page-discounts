'use client';
import { Search, X, Loader2, Check } from 'lucide-react';

export default function CustomerCatalogSelector({
    catalogSearch,
    setCatalogSearch,
    loadingCatalog,
    filteredCustomers,
    addedIds,
    onSelectCustomer
}) {
    return (
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 shadow-md flex flex-col justify-start space-y-4">
            <div>
                <h3 className="text-sm font-bold text-slate-800">Buscador y Selector de Clientes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Encuentra y vincula clientes en tiempo real desde el catálogo.</p>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={15} />
                </div>
                <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Teclea el nombre, código o RFC del cliente..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
                {catalogSearch && (
                    <button onClick={() => setCatalogSearch('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                        <X size={13} />
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-[300px] max-h-[450px] overflow-y-auto border border-slate-100 bg-white/50 rounded-xl custom-scrollbar p-2 space-y-1 shadow-inner">
                {loadingCatalog ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
                        <Loader2 className="animate-spin text-indigo-500" size={18} />
                        <p className="text-xs font-semibold">Indexando catálogo de clientes...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-14 text-slate-400 text-xs font-medium italic">
                        No se encontraron clientes coincidentes.
                    </div>
                ) : (
                    filteredCustomers.map((customer) => {
                        const isAlreadyAdded = addedIds.includes(customer.codigo_cliente);
                        return (
                            <div
                                key={`catalog-c-${customer.id}`}
                                className={`flex justify-between items-center p-2.5 rounded-lg border text-xs transition-all ${isAlreadyAdded
                                    ? 'bg-slate-50 border-slate-200 opacity-60'
                                    : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <div className="max-w-[75%] space-y-0.5">
                                    <div className="font-bold text-slate-800 truncate">{customer.nombre_cliente}</div>
                                    <div className="text-[10px] text-indigo-600 font-mono font-bold">
                                        {customer.codigo_cliente}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={isAlreadyAdded}
                                    onClick={() => onSelectCustomer(customer.codigo_cliente)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 active:scale-95 ${isAlreadyAdded
                                        ? 'bg-teal-50 text-teal-600 border border-teal-200 cursor-default flex items-center gap-1'
                                        : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600'
                                        }`}
                                >
                                    {isAlreadyAdded ? <><Check size={11} /> Añadido</> : 'Vincular'}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}