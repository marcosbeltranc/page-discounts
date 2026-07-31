'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

import GroupListHeader from '@/components/product-groups/GroupListHeader';
import GroupListTable from '@/components/product-groups/GroupListTable';
import GroupFormConfig from '@/components/product-groups/GroupFormConfig';
import ProductCatalogSelector from '@/components/product-groups/ProductCatalogSelector';

const createInitialFormState = () => ({
    id: '',
    group: '',
    values: [],
    type: 'manual',
    active: true
});

const normalizeSku = (value) => String(value ?? '').trim().toUpperCase();

const isActive = (value) => (
    value === true || value === 1 || value === '1' || value === 'true'
);

export default function ProductGroupsPage() {
    const [view, setView] = useState('list');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [productsCatalog, setProductsCatalog] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [formData, setFormData] = useState(createInitialFormState);

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

            const response = await api.get('/product-groups');
            const resData = unwrapResponse(response);

            if (!resData) {
                toast.error('El servidor no envió datos válidos.');
                return;
            }

            if (
                resData.error === true ||
                resData.error === 1 ||
                resData.error === 'true'
            ) {
                toast.error(resData.result || 'Error reportado por el servidor.');
                setGroups([]);
                return;
            }

            const rawGroups = resData.result;

            if (typeof rawGroups === 'string') {
                setGroups([]);

                if (!rawGroups.toLowerCase().includes('no se encontraron')) {
                    toast.error(rawGroups);
                }

                return;
            }

            if (!Array.isArray(rawGroups)) {
                setGroups([]);
                return;
            }

            const sanitizedGroups = rawGroups.map((group) => {
                let parsedValues = [];

                if (Array.isArray(group.values)) {
                    parsedValues = group.values;
                } else if (typeof group.values === 'string') {
                    try {
                        const parsed = JSON.parse(group.values);
                        parsedValues = Array.isArray(parsed) ? parsed : [];
                    } catch {
                        parsedValues = [];
                    }
                }

                return {
                    ...group,
                    values: [...new Set(
                        parsedValues
                            .map(normalizeSku)
                            .filter(Boolean)
                    )]
                };
            });

            setGroups(sanitizedGroups);
        } catch (error) {
            console.error('Error al cargar grupos de productos:', error);
            toast.error('Error de conexión con el servidor.');
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
                const validProducts = resData.result.filter(
                    product => product.sku || product.codigo_sap
                );

                setProductsCatalog(validProducts);
                return;
            }

            setProductsCatalog([]);
            toast.error('El catálogo de productos no contiene datos válidos.');
        } catch (error) {
            console.error('Error al cargar el catálogo de productos:', error);
            toast.error('No se pudo cargar el catálogo auxiliar.');
        } finally {
            setLoadingCatalog(false);
        }
    };

    const filteredGroups = useMemo(() => {
        const cleanSearch = searchTerm.trim().toLowerCase();

        return groups.filter((group) => {
            if (activeTab !== 'all' && group.type !== activeTab) {
                return false;
            }

            if (!cleanSearch) return true;

            const matchesName = String(group.group ?? '')
                .toLowerCase()
                .includes(cleanSearch);

            const matchesSku = Array.isArray(group.values) && group.values.some(
                sku => String(sku).toLowerCase().includes(cleanSearch)
            );

            return matchesName || matchesSku;
        });
    }, [groups, searchTerm, activeTab]);

    const automaticGroups = useMemo(() => {
        return groups.filter(
            group => group.type === 'auto' && isActive(group.active)
        );
    }, [groups]);

    const openCreateView = () => {
        setFormData(createInitialFormState());
        setCatalogSearch('');
        setView('add');
        fetchProductsCatalog();
    };

    const openEditView = (group) => {
        setFormData({
            id: group.id,
            group: group.group || '',
            values: Array.isArray(group.values)
                ? [...new Set(group.values.map(normalizeSku).filter(Boolean))]
                : [],
            type: group.type || 'manual',
            active: isActive(group.active)
        });

        setCatalogSearch('');
        setView('edit');
        fetchProductsCatalog();
    };

    const handleToggleSku = (sku) => {
        const normalizedSku = normalizeSku(sku);
        if (!normalizedSku) return;

        setFormData((previous) => {
            const currentValues = (previous.values || [])
                .map(normalizeSku)
                .filter(Boolean);

            const isSelected = currentValues.includes(normalizedSku);

            return {
                ...previous,
                values: isSelected
                    ? currentValues.filter(value => value !== normalizedSku)
                    : [...currentValues, normalizedSku]
            };
        });
    };

    const handleToggleGroup = (skus, checked) => {
        const normalizedGroupSkus = [...new Set(
            (skus || []).map(normalizeSku).filter(Boolean)
        )];

        if (normalizedGroupSkus.length === 0) return;

        const groupSkuSet = new Set(normalizedGroupSkus);

        setFormData((previous) => {
            const currentValues = (previous.values || [])
                .map(normalizeSku)
                .filter(Boolean);

            return {
                ...previous,
                values: checked
                    ? [...new Set([...currentValues, ...normalizedGroupSkus])]
                    : currentValues.filter(sku => !groupSkuSet.has(sku))
            };
        });
    };

    const handleRemoveSku = (sku) => {
        const normalizedSku = normalizeSku(sku);

        setFormData((previous) => ({
            ...previous,
            values: (previous.values || [])
                .map(normalizeSku)
                .filter(value => value && value !== normalizedSku)
        }));
    };

    const handleReplaceSelection = (skus) => {
        const normalizedSkus = [...new Set(
            (skus || []).map(normalizeSku).filter(Boolean)
        )];

        setFormData((previous) => ({
            ...previous,
            // Reemplaza por completo cualquier selección anterior.
            values: normalizedSkus
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            ...formData,
            group: formData.group.trim(),
            values: [...new Set(
                (formData.values || []).map(normalizeSku).filter(Boolean)
            )]
        };

        if (!payload.group) {
            toast.error('El nombre del grupo es obligatorio.');
            return;
        }

        if (payload.values.length === 0) {
            toast.error('Debes agregar al menos un SKU.');
            return;
        }

        try {
            setActionLoading(true);

            const response = view === 'add'
                ? await api.post('/product-groups/create', payload)
                : await api.put(`/product-groups/update/${payload.id}`, payload);

            const resData = unwrapResponse(response);

            if (
                resData && (
                    resData.error === false ||
                    resData.error === 0 ||
                    resData.error === 'false'
                )
            ) {
                toast.success(
                    view === 'add'
                        ? 'Grupo creado exitosamente.'
                        : 'Grupo actualizado con éxito.'
                );

                await fetchGroups();
                setView('list');
            } else {
                toast.error(
                    resData?.result || 'Ocurrió un error al procesar la solicitud.'
                );
            }
        } catch (error) {
            console.error('Error al guardar grupo de productos:', error);
            toast.error('Error al conectar con la API.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        toast('¿Estás seguro de que deseas eliminar este grupo?', {
            action: {
                label: 'Eliminar',
                onClick: async () => {
                    try {
                        const response = await api.delete(
                            `/product-groups/delete/${id}`
                        );
                        const resData = unwrapResponse(response);

                        if (
                            resData && (
                                resData.error === false ||
                                resData.error === 0 ||
                                resData.error === 'false'
                            )
                        ) {
                            toast.success('Grupo eliminado exitosamente.');
                            fetchGroups();
                        } else {
                            toast.error(
                                resData?.result || 'No se pudo eliminar el grupo.'
                            );
                        }
                    } catch (error) {
                        console.error('Error al eliminar grupo de productos:', error);
                        toast.error('Error al intentar eliminar el registro.');
                    }
                }
            },
            cancel: { label: 'Cancelar' }
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <GroupListHeader
                view={view}
                onCreateClick={openCreateView}
            />

            {view === 'list' ? (
                <GroupListTable
                    groups={groups}
                    filteredGroups={filteredGroups}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onEditClick={openEditView}
                    onDeleteClick={handleDelete}
                />
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <GroupFormConfig
                        view={view}
                        formData={formData}
                        setFormData={setFormData}
                        actionLoading={actionLoading}
                        onSubmit={handleSubmit}
                        onCancel={() => setView('list')}
                        onRemoveSku={handleRemoveSku}
                    />

                    <ProductCatalogSelector
                        catalogSearch={catalogSearch}
                        setCatalogSearch={setCatalogSearch}
                        loadingCatalog={loadingCatalog}
                        products={productsCatalog}
                        automaticGroups={automaticGroups}
                        selectedSkus={formData.values}
                        onToggleSku={handleToggleSku}
                        onToggleGroup={handleToggleGroup}
                        onReplaceSelection={handleReplaceSelection}
                    />
                </div>
            )}
        </div>
    );
}
