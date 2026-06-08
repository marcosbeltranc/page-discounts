'use client';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PromoStockMonitor({ promos }) {
    const criticalItems = promos.filter(p => p.stock_disponible <= 500);

    return (
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 shadow-md flex flex-col justify-start space-y-4">
            <div>
                <h3 className="text-sm font-bold text-slate-800">Monitor de Alerta de Existencias</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control preventivo de materiales próximos a agotarse en inventario centralizado.</p>
            </div>

            <div className="flex-1 min-h-[300px] max-h-[420px] overflow-y-auto border border-slate-100 bg-white/50 rounded-xl p-3 space-y-2 shadow-inner custom-scrollbar">
                {criticalItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                        <CheckCircle2 className="text-emerald-500" size={32} />
                        <p className="text-xs font-bold text-slate-700">Todos los materiales tienen existencias sanas.</p>
                    </div>
                ) : (
                    criticalItems.map((item) => (
                        <div key={`crit-${item.id}`} className="flex justify-between items-center bg-white border border-rose-100 p-3 rounded-xl shadow-sm">
                            <div className="max-w-[75%] space-y-0.5">
                                <div className="text-xs font-bold text-slate-800 truncate">{item.nombre}</div>
                                <div className="text-[10px] text-rose-600 font-mono font-bold uppercase flex items-center gap-1">
                                    <AlertTriangle size={11} /> {item.sku}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="block text-[11px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                                    {item.stock_disponible} pzas
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}