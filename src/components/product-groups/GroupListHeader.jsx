'use client';
import { Layers, Plus } from 'lucide-react';

export default function GroupListHeader({ view, onCreateClick }) {
    return (
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 pb-5">
            {/* <div>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-600 shadow-sm">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            Grupos de Productos
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Agrupaciones estructurales de SKUs para promociones y analítica.</p>
                    </div>
                </div>
            </div> */}

            {view === 'list' && (
                <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus size={14} />
                    Crear Grupo Manual
                </button>
            )}
        </div>
    );
}