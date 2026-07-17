'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import CustomerHeader from '@/components/customers/CustomerHeader';
import CustomerFilters from '@/components/customers/CustomerFilters';
import CustomerTable from '@/components/customers/CustomerTable';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/customers');
            const res = response.data || response;
            setCustomers(Array.isArray(res) ? res : (res?.result || []));
        } catch (error) {
            toast.error('Error al conectar con la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.nombre_cliente?.toLowerCase().includes(q) ||
            c.codigo_cliente?.toLowerCase().includes(q) ||
            c.rfc?.toLowerCase().includes(q)
        );
    }, [searchTerm, customers]);

    return (
        <div className="max-w-7xl mx-auto">
            <CustomerHeader onRefresh={fetchCustomers} loading={loading} />
            <CustomerFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <br />
            <CustomerTable customers={filteredCustomers} loading={loading} />
        </div>
    );
}