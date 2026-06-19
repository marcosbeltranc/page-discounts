'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

// Importación de los componentes de clientes
import CustomerHeader from '@/components/customers/CustomerHeader';
import CustomerFilters from '@/components/customers/CustomerFilters';
import CustomerTable from '@/components/customers/CustomerTable';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setErrorMsg('');

            const response = await api.get('/customers');

            // --- AQUÍ ESTÁ LA MAGIA ---
            // Si usas Axios, response.data es el cuerpo.
            // Si el JSON viene directo, 'response' es el objeto.
            const res = response.data ? response.data : response;

            console.log("Estructura detectada:", res);

            if (res && res.result) {
                setCustomers(res.result);
            } else if (Array.isArray(res)) {
                // Por si acaso la API devuelve el array directo algún día
                setCustomers(res);
            } else {
                console.error("No se encontró el array de clientes en:", res);
                setErrorMsg("Error: El formato de datos recibido es inesperado.");
            }
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            setErrorMsg("Error al conectar con la base de datos.");
        } finally {
            setLoading(false);
        }
    };
    // Filtro de búsqueda (lógica aplicada en el frontend)
    const filteredCustomers = useMemo(() => {
        console.log(customers)
        return customers.filter(c =>
            c.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.codigo_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, customers]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <CustomerHeader onRefresh={fetchCustomers} loading={loading} />

            <CustomerFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                totalCount={customers.length}
            />

            {/* Pasamos los 1800+ registros directamente, el componente se encarga del resto */}
            <CustomerTable
                customers={customers}
                loading={loading}
                searchTerm={searchTerm}
            />
        </div>
    );
}