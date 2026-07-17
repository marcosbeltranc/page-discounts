'use client';
import { Plus } from 'lucide-react';

export default function CustomerListHeader({ view, onCreateClick }) {
    return (
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 pb-5">
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