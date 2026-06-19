'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';

import PromotionalListHeader from '@/components/promotional-groups/PromotionalListHeader';
import PromotionalListTable from '@/components/promotional-groups/PromotionalListTable';
import PromotionalFormConfig from '@/components/promotional-groups/PromotionalFormConfig';
import ProductCatalogSelector from '@/components/promotional-groups/ProductCatalogSelector';

export default function PromotionalGroupsPage() {
    const [view, setView] = useState('list');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [formData, setFormData] = useState({ id: '', group: '', values: [], active: true });

    const [searchTerm, setSearchTerm] = useState('');
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [catalogSearch, setCatalogSearch] = useState('');

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchGroups(), fetchCatalog()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/promotional-product-groups');
            // Si el interceptor devuelve res.data, usamos res directamente, sino res.data
            const data = res.result ? res : (res.data || {});
            setGroups(data.result || []);
        } catch (error) {
            console.error("Error al cargar grupos:", error);
            setGroups([]);
        }
    };

    const fetchCatalog = async () => {
        try {
            const res = await api.get('/promotional-products');
            const data = res.result ? res : (res.data || {});
            setCatalogProducts(data.result || []);
        } catch (error) {
            console.error("Error al cargar catálogo:", error);
            setCatalogProducts([]);
        }
    };

    const filteredGroups = useMemo(() =>
        groups.filter(g => g.group?.toLowerCase().includes(searchTerm.toLowerCase())),
        [groups, searchTerm]);

    const filteredCatalog = useMemo(() => {
        if (!catalogSearch) return catalogProducts;
        return catalogProducts.filter(p =>
            p.nombre?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
            p.sku?.toLowerCase().includes(catalogSearch.toLowerCase())
        );
    }, [catalogSearch, catalogProducts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const endpoint = formData.id
                ? `/promotional-product-groups/update/${formData.id}`
                : '/promotional-product-groups/create';
            await api.post(endpoint, formData);
            await fetchGroups();
            setView('list');
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <PromotionalListHeader
                view={view}
                onCreateClick={() => {
                    setFormData({ id: '', group: '', values: [], active: true });
                    setView('add');
                }}
            />

            {view === 'list' ? (
                <PromotionalListTable
                    groups={groups}
                    filteredGroups={filteredGroups}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onEditClick={(g) => {
                        setFormData({
                            id: g.id,
                            group: g.group,
                            values: Array.isArray(g.values) ? [...g.values] : [],
                            active: g.active
                        });
                        setView('edit');
                    }}
                    onDeleteClick={async (id) => {
                        await api.delete(`/promotional-product-groups/delete/${id}`);
                        fetchGroups();
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <PromotionalFormConfig
                        view={view}
                        formData={formData}
                        setFormData={setFormData}
                        actionLoading={actionLoading}
                        onSubmit={handleSubmit}
                        onCancel={() => setView('list')}
                        onRemoveProduct={(sku) => setFormData({
                            ...formData,
                            values: formData.values.filter(v => v !== sku)
                        })}
                    />
                    <ProductCatalogSelector
                        catalogSearch={catalogSearch}
                        setCatalogSearch={setCatalogSearch}
                        filteredProducts={filteredCatalog}
                        addedIds={formData.values}
                        onSelectProduct={(sku) => setFormData({
                            ...formData,
                            values: formData.values.includes(sku)
                                ? formData.values
                                : [...formData.values, sku]
                        })}
                    />
                </div>
            )}
        </div>
    );
}