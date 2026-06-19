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
    const [actionLoading, setActionLoading] = useState(false); // Estado agregado
    const [formData, setFormData] = useState({ id: '', group: '', values: [], active: true });

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
        const res = await api.get('/customers');
        const data = res.data || res;
        setCatalogCustomers(data.result || []);
    };

    // Filtros
    const filteredGroups = useMemo(() => {
        return groups.filter(g =>
            g.group?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
    }, [groups, searchTerm]);

    const filteredCatalog = useMemo(() => {
        return catalogCustomers.filter(c =>
            c.nombre_cliente?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
            c.codigo_cliente?.includes(catalogSearch)
        ) || [];
    }, [catalogSearch, catalogCustomers]);

    // Lógica de guardado
    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/customer-groups', formData);
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
            <GroupListHeader view={view} onCreateClick={() => setView('add')} />

            {view === 'list' ? (
                <GroupListTable
                    groups={groups}
                    filteredGroups={filteredGroups}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onEditClick={(g) => { setFormData(g); setView('edit'); }}
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
                        filteredCustomers={filteredCatalog}
                        addedIds={formData.values}
                        onSelectCustomer={(id) => setFormData({
                            ...formData,
                            values: formData.values.includes(id) ? formData.values : [...formData.values, id]
                        })}
                    />
                </div>
            )}
        </div>
    );
}