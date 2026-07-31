'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import GroupListHeader from '@/components/customer-groups/GroupListHeader';
import GroupListTable from '@/components/customer-groups/GroupListTable';
import GroupFormConfig from '@/components/customer-groups/GroupFormConfig';
import CustomerCatalogSelector from '@/components/customer-groups/CustomerCatalogSelector';

export default function CustomerGroupsPage() {
    const [view, setView] = useState('list');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [loadingCatalog, setLoadingCatalog] = useState(true);

    const [formData, setFormData] = useState({
        id: '',
        group: '',
        type: 'manual',
        values: [],
        active: true
    });

    // Estados para buscador
    const [searchTerm, setSearchTerm] = useState('');
    const [catalogCustomers, setCatalogCustomers] = useState([]);
    const [catalogSearch, setCatalogSearch] = useState('');

    useEffect(() => {
        fetchGroups();
        fetchCatalog();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        const res = await api.get('/customer-groups');
        const data = res.data || res;
        setGroups(data.result || []);
        setLoading(false);
    };

    const fetchCatalog = async () => {
        setLoadingCatalog(true);

        try {
            const res = await api.get('/customers');
            const data = res.data || res;

            setCatalogCustomers(data.result || []);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            setCatalogCustomers([]);
        } finally {
            setLoadingCatalog(false);
        }
    };

    // Filtros
    const filteredGroups = useMemo(() => {
        return groups.filter((group) => {
            const matchesTab = activeTab === 'all' || group.type === activeTab;
            const matchesSearch = searchTerm.toLowerCase() === '' ||
                group.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.values.some(v => v.includes(searchTerm));
            return matchesTab && matchesSearch;
        });
    }, [groups, searchTerm, activeTab]);

    // const filteredCatalog = useMemo(() => {
    //     return catalogCustomers.filter(c =>
    //         c.nombre_cliente?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    //         c.codigo_cliente?.includes(catalogSearch)
    //     ) || [];
    // }, [catalogSearch, catalogCustomers]);

    const handleCreateClick = () => {
        setFormData({
            id: '',
            group: '',
            type: 'manual',
            values: [],
            active: true
        });

        setCatalogSearch('');
        setView('add');
    };

    const automaticGroups = useMemo(() => {
        return groups.filter(
            group => group.type === 'auto' && group.active
        );
    }, [groups]);

    // Lógica de guardado
    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/customer-groups/create', formData);
            await fetchGroups();
            setView('list');
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Asegúrate de tener importado 'toast' de 'sonner'
        toast('¿Estás seguro de que deseas eliminar este grupo?', {
            action: {
                label: 'Eliminar',
                onClick: async () => {
                    try {
                        // Ajusta la ruta según tu endpoint de clientes
                        const response = await api.delete(`/customer-groups/delete/${id}`);
                        const resData = response.data || response;

                        if (resData && (resData.error === false || resData.error === 0)) {
                            toast.success('Grupo eliminado exitosamente.');
                            fetchGroups();
                        } else {
                            toast.error(resData?.result || 'No se pudo eliminar el grupo.');
                        }
                    } catch (err) {
                        toast.error('Error al intentar eliminar el registro.');
                    }
                }
            },
            cancel: { label: 'Cancelar' }
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* <GroupListHeader view={view} onCreateClick={() => setView('add')} /> */}

            <GroupListHeader
                view={view}
                onCreateClick={handleCreateClick}
            />

            {view === 'list' ? (
                <GroupListTable
                    groups={groups}
                    filteredGroups={filteredGroups}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    activeTab={activeTab}       // Verifica que coincida
                    setActiveTab={setActiveTab} // Verifica que coincida
                    onEditClick={(g) => { setFormData(g); setView('edit'); }}
                    onDeleteClick={handleDelete} // Asegúrate de tener esta función
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <GroupFormConfig
                        view={view}
                        formData={formData}
                        setFormData={setFormData}
                        actionLoading={actionLoading}
                        onSubmit={handleSubmit}
                        onCancel={() => setView('list')}
                        onRemoveCustomer={(id) => setFormData({
                            ...formData,
                            values: formData.values.filter(v => v !== id)
                        })}
                    />
                    <CustomerCatalogSelector
                        catalogSearch={catalogSearch}
                        setCatalogSearch={setCatalogSearch}
                        loadingCatalog={loadingCatalog}
                        customers={catalogCustomers}
                        automaticGroups={automaticGroups}
                        selectedIds={formData.values}

                        onToggleCustomer={(customerId) => {
                            const normalizedId = String(customerId);

                            setFormData(prev => {
                                const currentValues = (prev.values || []).map(String);
                                const isSelected = currentValues.includes(normalizedId);

                                return {
                                    ...prev,
                                    values: isSelected
                                        ? currentValues.filter(id => id !== normalizedId)
                                        : [...currentValues, normalizedId]
                                };
                            });
                        }}

                        onToggleGroup={(customerIds, checked) => {
                            const normalizedGroupIds = customerIds.map(String);
                            const groupIdSet = new Set(normalizedGroupIds);

                            setFormData(prev => {
                                const currentValues = (prev.values || []).map(String);

                                return {
                                    ...prev,
                                    values: checked
                                        ? [...new Set([
                                            ...currentValues,
                                            ...normalizedGroupIds
                                        ])]
                                        : currentValues.filter(id => !groupIdSet.has(id))
                                };
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
}