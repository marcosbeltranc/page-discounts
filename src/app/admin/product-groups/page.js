'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

import GroupListHeader from '@/components/product-groups/GroupListHeader';
import GroupListTable from '@/components/product-groups/GroupListTable';
import GroupFormConfig from '@/components/product-groups/GroupFormConfig';
import ProductCatalogSelector from '@/components/product-groups/ProductCatalogSelector';

export default function ProductGroupsPage() {
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [productsCatalog, setProductsCatalog] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [currentSku, setCurrentSku] = useState('');

    const initialFormState = {
        id: '',
        group: '',
        values: [],
        type: 'manual',
        active: true
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchGroups();
    }, []);

    const unwrapResponse = (res) => {
        if (!res) return null;
        return res.data !== undefined ? res.data : res;
    };

    const fetchGroups = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const response = await api.get('/product-groups');
            const resData = unwrapResponse(response);

            if (!resData) {
                setErrorMsg('El servidor no envió datos válidos.');
                return;
            }
            if (resData.error === true || resData.error === 1 || resData.error === 'true') {
                setErrorMsg(resData.result || 'Error reportado por el servidor.');
                setGroups([]);
                return;
            }

            let rawGroups = resData.result;
            if (typeof rawGroups === 'string') {
                setGroups([]);
                if (!rawGroups.toLowerCase().includes('no se encontraron')) setErrorMsg(rawGroups);
                return;
            }

            if (Array.isArray(rawGroups)) {
                const sanitizedGroups = rawGroups.map((group) => {
                    let parsedValues = [];
                    if (Array.isArray(group.values)) parsedValues = group.values;
                    else if (typeof group.values === 'string') {
                        try {
                            const parsed = JSON.parse(group.values);
                            parsedValues = Array.isArray(parsed) ? parsed : [];
                        } catch (e) { parsedValues = []; }
                    }
                    return { ...group, values: parsedValues };
                });
                setGroups(sanitizedGroups);
            } else {
                setGroups([]);
            }
        } catch (err) {
            setErrorMsg('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsCatalog = async () => {
        if (productsCatalog.length > 0) return;
        try {
            setLoadingCatalog(true);
            const response = await api.get('/products');
            const resData = unwrapResponse(response);
            if (resData && !resData.error && Array.isArray(resData.result)) {
                const validProducts = resData.result.filter(p => p.sku || p.codigo_sap);
                setProductsCatalog(validProducts);
            }
        } catch (err) {
            console.error('No se pudo cargar el catálogo auxiliar:', err);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.group.trim()) return setErrorMsg('El nombre del grupo es obligatorio.');
        if (!formData.values || formData.values.length === 0) return setErrorMsg('Debes agregar al menos un SKU.');

        try {
            setActionLoading(true);
            setErrorMsg('');
            setSuccessMsg('');

            let response = view === 'add'
                ? await api.post('/product-groups/create', formData)
                : await api.put(`/product-groups/update/${formData.id}`, formData);

            const resData = unwrapResponse(response);

            if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                setSuccessMsg(view === 'add' ? 'Grupo creado exitosamente.' : 'Grupo actualizado con éxito.');
                await fetchGroups();
                setTimeout(() => setView('list'), 1000);
            } else {
                setErrorMsg(resData?.result || 'Ocurrió un error al procesar la solicitud.');
            }
        } catch (err) {
            setErrorMsg('Error al conectar con la API.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este grupo?')) return;
        try {
            setErrorMsg('');
            const response = await api.delete(`/product-groups/delete/${id}`);
            const resData = unwrapResponse(response);
            if (resData && (resData.error === false || resData.error === 0 || resData.error === 'false')) {
                fetchGroups();
            } else {
                setErrorMsg(resData?.result || 'No se pudo eliminar el grupo.');
            }
        } catch (err) {
            setErrorMsg('Error al intentar eliminar el registro.');
        }
    };

    const filteredGroups = useMemo(() => {
        const cleanSearch = searchTerm.trim().toLowerCase();
        if (!cleanSearch && activeTab === 'all') return groups;
        return groups.filter((group) => {
            if (activeTab !== 'all' && group.type !== activeTab) return false;
            if (!cleanSearch) return true;
            if (group.group?.toLowerCase().includes(cleanSearch)) return true;
            if (Array.isArray(group.values)) {
                return group.values.some(sku => sku && sku.toLowerCase().includes(cleanSearch));
            }
            return false;
        });
    }, [groups, searchTerm, activeTab]);

    const filteredCatalogProducts = useMemo(() => {
        const query = catalogSearch.trim().toLowerCase();
        if (!query) return productsCatalog.slice(0, 12);
        return productsCatalog.filter(product => {
            return product.sku?.toLowerCase().includes(query) ||
                product.codigo_sap?.toLowerCase().includes(query) ||
                product.descripcion?.toLowerCase().includes(query) ||
                product.marca?.toLowerCase().includes(query);
        }).slice(0, 20);
    }, [productsCatalog, catalogSearch]);

    const handleSelectSku = (skuCode) => {
        const cleanSku = skuCode.trim().toUpperCase();
        if (formData.values.includes(cleanSku)) return setErrorMsg(`El SKU "${cleanSku}" ya forma parte de este grupo.`);
        setErrorMsg('');
        setFormData({ ...formData, values: [...formData.values, cleanSku] });
    };

    const handleManualSkuAdd = () => {
        const cleanSku = currentSku.trim().toUpperCase();
        if (!cleanSku) return;
        if (formData.values.includes(cleanSku)) return setErrorMsg(`El SKU "${cleanSku}" ya está agregado.`);
        setErrorMsg('');
        setFormData({ ...formData, values: [...formData.values, cleanSku] });
        setCurrentSku('');
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">

            <GroupListHeader
                view={view}
                onCreateClick={() => {
                    setFormData(initialFormState); setErrorMsg(''); setSuccessMsg('');
                    setCurrentSku(''); setCatalogSearch(''); setView('add'); fetchProductsCatalog();
                }}
            />

            {/* ALERTAS GLOBALES CLARAS */}
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

            {/* CONTROL DE VISTAS FULL PAGE */}
            {view === 'list' ? (
                <GroupListTable
                    groups={groups} filteredGroups={filteredGroups} loading={loading}
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    activeTab={activeTab} setActiveTab={setActiveTab}
                    onEditClick={(group) => {
                        setFormData({
                            id: group.id, group: group.group || '',
                            values: Array.isArray(group.values) ? [...group.values] : [],
                            type: group.type || 'manual', active: group.active === true || group.active === 1
                        });
                        setErrorMsg(''); setSuccessMsg(''); setCurrentSku(''); setCatalogSearch(''); setView('edit'); fetchProductsCatalog();
                    }}
                    onDeleteClick={handleDelete}
                />
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <GroupFormConfig
                        view={view} formData={formData} setFormData={setFormData}
                        actionLoading={actionLoading} onSubmit={handleSubmit}
                        onCancel={() => setView('list')}
                        onRemoveSku={(sku) => setFormData({ ...formData, values: formData.values.filter(s => s !== sku) })}
                    />

                    <ProductCatalogSelector
                        catalogSearch={catalogSearch} setCatalogSearch={setCatalogSearch}
                        loadingCatalog={loadingCatalog} filteredCatalogProducts={filteredCatalogProducts}
                        addedSkus={formData.values} onSelectSku={handleSelectSku}
                        currentSku={currentSku} setCurrentSku={setCurrentSku}
                        onManualSubmit={handleManualSkuAdd}
                    />
                </div>
            )}
        </div>
    );
}