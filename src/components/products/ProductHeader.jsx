'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Package, RefreshCw, DatabaseZap, Loader2 } from 'lucide-react';

export default function ProductHeader({ onRefresh, loading }) {
    const [syncingSap, setSyncingSap] = useState(false);

    const handleSyncSap = async () => {
        if (!window.confirm('¿Deseas iniciar la sincronización masiva desde SAP Hana? Esto actualizará precios, estatus y auto-agrupará marcas y laboratorios.')) {
            return;
        }

        try {
            setSyncingSap(true);

            // Reemplaza esto por la ruta exacta que apunta a tu método de sincronización en Laravel
            // Ej: Route::post('/products/sync', [ProductController::class, 'sync']);
            const response = await api.post('/products/sync');

            if (response.data && !response.data.error) {
                alert('Sincronización completada con éxito: ' + response.data.result);
                // Una vez sincronizado el backend con SAP, refrescamos la pantalla local
                onRefresh();
            } else {
                alert('Error al sincronizar con SAP: ' + (response.data?.result || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            alert('Error crítico de conexión al intentar comunicarse con SAP Hana.');
        } finally {
            setSyncingSap(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/60">
            <div>
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
            </div>

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