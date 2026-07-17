'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Package, RefreshCw, DatabaseZap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductHeader({ onRefresh, loading }) {
    const [syncingSap, setSyncingSap] = useState(false);

    const unwrapResponse = (res) => {
        if (!res) return null;
        return res.data !== undefined ? res.data : res;
    };

    const handleSyncSap = async () => {
        toast('¿Iniciar la sincronización?', {
            description: 'Esto actualizará tu lista de productos desde SAP',
            action: {
                label: 'Confirmar',
                onClick: async () => {
                    // 2. Aquí movemos toda la lógica de ejecución del sync
                    try {
                        setSyncingSap(true);
                        const response = await api.post('/products/sync');
                        const resData = unwrapResponse(response);

                        if (resData.error === false) {
                            toast.success('Sincronización completada', { description: resData.result });
                            onRefresh();
                        } else {
                            toast.error('Error al sincronizar', { description: resData.result });
                        }
                    } catch (error) {
                        toast.error('Error crítico de conexión con SAP Hana.');
                    } finally {
                        setSyncingSap(false);
                    }
                }
            },
            cancel: {
                label: 'Cancelar'
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 pb-5 ">
            {/* <div>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-600 shadow-sm">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            Catálogo Master de Productos
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Consulta de SKUs y Precios base de la base de datos local.
                        </p>
                    </div>
                </div>
            </div> */}

            {/* Acciones de Datos Clara e Independientes */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

                {/* BOTÓN SECUNDARIO: Solo limpia/refresca la consulta local */}
                <button
                    onClick={onRefresh}
                    disabled={loading || syncingSap}
                    title="Actualizar la tabla con los datos locales de PostgreSQL"
                    className="flex items-center justify-center p-2.5 bg-white/80 hover:bg-white text-slate-600 border border-slate-200 rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
                </button>

                {/* BOTÓN PRINCIPAL: Ejecuta el Sync real pesado de SAP */}
                <button
                    onClick={handleSyncSap}
                    disabled={loading || syncingSap}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border border-indigo-700/10 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-60 active:scale-95"
                >
                    {syncingSap ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Sincronizando SAP Hana...</span>
                        </>
                    ) : (
                        <>
                            <DatabaseZap size={14} />
                            <span>Importar desde SAP</span>
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}