'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Users, RefreshCw, DatabaseZap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerHeader({ onRefresh, loading }) {
    const [syncingSap, setSyncingSap] = useState(false);

    const handleSyncSap = async () => {
        toast('¿Iniciar la sincronización?', {
            description: 'Esto actualizará tu lista de clientes desde SAP',
            action: {
                label: 'Continuar',
                onClick: async () => {
                    setSyncingSap(true);
                    try {
                        const res = await api.post('/customers/sync');
                        onRefresh();
                        if (res.error !== true) {
                            toast.success('Sincronización exitosa.');
                        } else {
                            toast.error('Error al sincronizar clientes.');
                        }
                    } catch (error) {
                        toast.error('Error al sincronizar clientes.');
                    } finally {
                        setSyncingSap(false);
                    }
                },
            },
            cancel: {
                label: 'Cancelar'
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 pb-5">
            {
                /* <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Users size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Catálogo de Clientes</h1>
                    </div>*/
            }

            <div className="flex gap-2">
                <button onClick={onRefresh} className="p-2.5 border rounded-xl hover:bg-slate-50">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                    onClick={handleSyncSap}
                    disabled={syncingSap}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                    {syncingSap ? <Loader2 className="animate-spin" size={14} /> : <DatabaseZap size={14} />}
                    Importar desde SAP
                </button>
            </div>
        </div>
    );
}