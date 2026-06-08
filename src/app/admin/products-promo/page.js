'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

// Mantenemos tus rutas de importación exactas
import PromoProductHeader from '@/components/products-promo/PromoProductHeader';
import PromoProductTable from '@/components/products-promo/PromoProductTable';
import PromoProductForm from '@/components/products-promo/PromoProductForm';
import PromoStockMonitor from '@/components/products-promo/PromoStockMonitor';

export default function PromoProductsPage() {
    const [view, setView] = useState('list');
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Listado principal filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Estado inicial adaptado a las propiedades de tu JSON real
    const initialFormState = {
        id: '',
        sku: '',
        nombre: '',
        tipo: 'folleto',
        stock_disponible: 0,
        activo: true
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchPromos();
    }, []);

    const unwrapResponse = (res) => {
        if (!res) return null;
        return res.data !== undefined ? res.data : res;
    };

    // GET - Route::get('/promotional-products/{id?}')
    const fetchPromos = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const response = await api.get('/promotional-products');
            const resData = unwrapResponse(response);

            if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                setPromos(Array.isArray(resData.result) ? resData.result : []);
            } else {
                setPromos([]);
                if (resData?.result && !resData.result.toLowerCase().includes('no se encontraron')) {
                    setErrorMsg(resData.result);
                }
            }
        } catch (err) {
            setErrorMsg('No se pudo establecer comunicación con el catálogo de materiales promocionales.');
        } finally {
            setLoading(false);
        }
    };

    // POST & PUT - /promotional-products/create y /promotional-products/update/{id}
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.sku.trim()) return setErrorMsg('El código SKU es obligatorio.');
        if (!formData.nombre.trim()) return setErrorMsg('El nombre o descripción del material es obligatorio.');

        try {
            setActionLoading(true);
            setErrorMsg('');
            setSuccessMsg('');

            const endpoint = view === 'add'
                ? '/promotional-products/create'
                : `/promotional-products/update/${formData.id}`;

            const response = view === 'add'
                ? await api.post(endpoint, formData)
                : await api.put(endpoint, formData);

            const resData = unwrapResponse(response);

            if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                setSuccessMsg(view === 'add' ? 'Material promocional creado con éxito.' : 'Material promocional actualizado con éxito.');
                await fetchPromos();
                setTimeout(() => setView('list'), 1000);
            } else {
                setErrorMsg(resData?.result || 'Error al guardar el material promocional.');
            }
        } catch (err) {
            setErrorMsg('Fallo de conexión con el servidor de inventario.');
        } finally {
            setActionLoading(false);
        }
    };

    // DELETE - /promotional-products/delete/{id}
    const handleDelete = async (id) => {
        if (!window.confirm('¿Deseas eliminar este material promocional del inventario?')) return;
        try {
            setErrorMsg('');
            const response = await api.delete(`/promotional-products/delete/${id}`);
            const resData = unwrapResponse(response);

            if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                fetchPromos();
            } else {
                setErrorMsg(resData?.result || 'No se pudo eliminar el material.');
            }
        } catch (e) {
            setErrorMsg('No se pudo ejecutar la remoción del material.');
        }
    };

    // Filtros calculados usando la estructura real del JSON (sku, nombre, tipo)
    const filteredPromos = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return promos.filter(p => {
            // Filtro por tipo de material (all, folleto, muestra, mercancia)
            if (activeTab !== 'all' && p.tipo !== activeTab) return false;

            if (!q) return true;
            return p.nombre?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
        });
    }, [promos, searchTerm, activeTab]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PromoProductHeader view={view} onCreateClick={() => { setFormData(initialFormState); setView('add'); }} />

            <div className="max-w-7xl mx-auto">
                {errorMsg && (
                    <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm shadow-sm">
                        <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                        <div>{errorMsg}</div>
                    </div>
                )}
                {successMsg && (
                    <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm shadow-sm">
                        <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                        <div>{successMsg}</div>
                    </div>
                )}
            </div>

            {view === 'list' ? (
                <PromoProductTable
                    promos={promos} filteredPromos={filteredPromos} loading={loading}
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    activeTab={activeTab} setActiveTab={setActiveTab}
                    onEditClick={(promo) => {
                        // Mapeo uno a uno de las propiedades de tu base de datos
                        setFormData({
                            id: promo.id,
                            sku: promo.sku || '',
                            nombre: promo.nombre || '',
                            tipo: promo.tipo || 'folleto',
                            stock_disponible: promo.stock_disponible || 0,
                            activo: promo.activo === true || promo.activo === 1 || promo.activo === '1'
                        });
                        setErrorMsg('');
                        setSuccessMsg('');
                        setView('edit');
                    }}
                    onDeleteClick={handleDelete}
                />
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <PromoProductForm
                        view={view} formData={formData} setFormData={setFormData}
                        actionLoading={actionLoading} onSubmit={handleSubmit}
                        onCancel={() => setView('list')}
                    />

                    {/* El monitor de existencias reemplaza al antiguo selector a la derecha */}
                    <PromoStockMonitor promos={promos} />
                </div>
            )}
        </div>
    );
}