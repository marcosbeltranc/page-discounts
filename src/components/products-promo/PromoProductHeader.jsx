'use client';
import { BadgePercent, Plus } from 'lucide-react';

export default function PromoProductHeader({ view, onCreateClick }) {
    return (
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 pb-5">
            {/* <div>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-600/10 rounded-xl border border-amber-500/20 text-amber-600 shadow-sm">
                        <BadgePercent size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            Material Promocional
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Gestión y control de inventario para material promocional.</p>
                    </div>
                </div>
            </div> */}

            {view === 'list' && (
                <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-100 transition-all active:scale-95"
                >
                    <Plus size={14} />
                    Alta de Material
                </button>
            )}
        </div>
    );
}