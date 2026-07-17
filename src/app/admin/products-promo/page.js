'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

import PromoProductHeader from '@/components/products-promo/PromoProductHeader';
import PromoProductTable from '@/components/products-promo/PromoProductTable';
import PromoProductForm from '@/components/products-promo/PromoProductForm';

export default function PromoProductsPage() {
    const [view, setView] = useState('list');
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

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

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/promotional-products');
            const resData = unwrapResponse(response);

            if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                setPromos(Array.isArray(resData.result) ? resData.result : []);
            } else {
                setPromos([]);
                if (resData?.result && !resData.result.toLowerCase().includes('no se encontraron')) {
                    toast.error(resData.result);
                }
            }
        } catch (err) {
            toast.error('No se pudo establecer comunicación con el catálogo.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.sku.trim()) return toast.error('El código SKU es obligatorio.');
        if (!formData.nombre.trim()) return toast.error('El nombre es obligatorio.');

        try {
            setActionLoading(true);
            const endpoint = view === 'add' ? '/promotional-products/create' : `/promotional-products/update/${formData.id}`;
            const response = view === 'add' ? await api.post(endpoint, formData) : await api.put(endpoint, formData);
            const resData = unwrapResponse(response);

            if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                toast.success(view === 'add' ? 'Material creado con éxito.' : 'Material actualizado con éxito.');
                await fetchPromos();
                setView('list');
            } else {
                toast.error(resData?.result || 'Error al guardar el material.');
            }
        } catch (err) {
            toast.error('Fallo de conexión con el servidor.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        toast('¿Deseas eliminar este material?', {
            action: {
                label: 'Eliminar',
                onClick: async () => {
                    try {
                        const response = await api.delete(`/promotional-products/delete/${id}`);
                        const resData = unwrapResponse(response);
                        if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                            toast.success('Eliminado con éxito.');
                            fetchPromos();
                        } else {
                            toast.error(resData?.result || 'No se pudo eliminar.');
                        }
                    } catch (e) {
                        toast.error('Error al ejecutar la remoción.');
                    }
                }
            },
            cancel: { label: 'Cancelar' }
        });
    };

    const filteredPromos = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return promos.filter(p => {
            if (activeTab !== 'all' && p.tipo !== activeTab) return false;
            if (!q) return true;
            return p.nombre?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
        });
    }, [promos, searchTerm, activeTab]);

    return (
        <div className="max-w-7xl mx-auto">
            <PromoProductHeader
                view={view}
                onCreateClick={() => { setFormData(initialFormState); setView('add'); }}
            />

            {view === 'list' ? (
                <PromoProductTable
                    promos={promos}
                    filteredPromos={filteredPromos}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onEditClick={(promo) => {
                        setFormData({
                            id: promo.id,
                            sku: promo.sku || '',
                            nombre: promo.nombre || '',
                            tipo: promo.tipo || 'folleto',
                            stock_disponible: promo.stock_disponible || 0,
                            activo: promo.activo === true || promo.activo === 1 || promo.activo === '1'
                        });
                        setView('edit');
                    }}
                    onDeleteClick={handleDelete}
                />
            ) : (
                <div className="max-w-7xl mx-auto space-y-6">
                    <PromoProductForm
                        view={view}
                        formData={formData}
                        setFormData={setFormData}
                        actionLoading={actionLoading}
                        onSubmit={handleSubmit}
                        onCancel={() => setView('list')}
                    />
                </div>
            )}
        </div>
    );
}