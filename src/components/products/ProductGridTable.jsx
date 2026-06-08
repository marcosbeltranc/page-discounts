'use client';
import { Loader2, Inbox, ArrowUpRight } from 'lucide-react';

export default function ProductGridTable({ products, loading, searchTerm }) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-slate-500">
                <Loader2 className="animate-spin text-indigo-600" size={36} />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Indexando base de datos local...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-24 border-2 border-dashed border-white/60 rounded-2xl bg-white/10 max-w-7xl mx-auto backdrop-blur-sm">
                <Inbox className="mx-auto text-slate-400 mb-3" size={44} />
                <p className="text-slate-500 font-bold text-sm">No se localizaron registros coincidentes.</p>
            </div>
        );
    }

    // Formateador de moneda de México
    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '$0.00';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
                const cleanQuery = searchTerm.trim().toLowerCase();
                const isSapMatched = cleanQuery && product.codigo_sap?.toLowerCase().includes(cleanQuery);
                const isSkuMatched = cleanQuery && product.sku?.toLowerCase().includes(cleanQuery);

                // Evaluar si está activo (acepta strings o booleanos según tu migración)
                const isProductActive = product.activo === 'Activo' || product.activo === true || product.activo === 1;

                return (
                    <div
                        key={product.id}
                        className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all group"
                    >
                        <div className="space-y-3.5">
                            {/* Cabecera del Item (Marcas e Indicador de Estado) */}
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex flex-wrap gap-1 max-w-[75%]">
                                    {product.marca && (
                                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider">
                                            {product.marca}
                                        </span>
                                    )}
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${isProductActive
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                                    }`}>
                                    {isProductActive ? 'Visb' : 'Oculto'}
                                </span>
                            </div>

                            {/* Descripción Principal */}
                            <div>
                                <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                    {product.descripcion}
                                </h3>
                                {product.laboratorio && (
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 italic truncate">
                                        {product.laboratorio}
                                    </p>
                                )}
                            </div>

                            {/* Bloque de Precios Masterizados */}
                            <div className="bg-white/50 border border-slate-100/80 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
                                <div>
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">P. Público + IVA</span>
                                    <span className="text-sm font-black text-slate-800">
                                        {formatCurrency(product.precio_publico_con_iva || product.precio_con_iva)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[9px] font-medium text-slate-400 uppercase tracking-wider">Base Neto</span>
                                    <span className="text-xs font-semibold text-slate-500">
                                        {formatCurrency(product.precio)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pie de la tarjeta: Identificadores SAP / SKU */}
                        <div className="mt-5 pt-3 border-t border-slate-100/80 space-y-1.5 text-[11px] font-mono">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 font-sans uppercase">Código SAP</span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${isSapMatched ? 'bg-amber-500 text-white font-black' : 'text-slate-600 bg-slate-50'}`}>
                                    {product.codigo_sap}
                                </span>
                            </div>
                            {product.sku && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 font-sans uppercase">SKU Canal</span>
                                    <span className={`px-1.5 py-0.5 rounded ${isSkuMatched ? 'bg-amber-500 text-white font-black' : 'text-slate-500 bg-slate-50'}`}>
                                        {product.sku}
                                    </span>
                                </div>
                            )}
                        </div>

                    </div>
                );
            })}
        </div>
    );
}