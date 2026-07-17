'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

// Importación de componentes divididos
import ProductHeader from '@/components/products/ProductHeader';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGridTable from '@/components/products/ProductGridTable';

export default function NormalProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const unwrapResponse = (res) => {
        if (!res) return null;
        return res.data !== undefined ? res.data : res;
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const response = await api.get('/products');
            const resData = unwrapResponse(response);

            if (!resData) {
                setErrorMsg('El servidor no devolvió una respuesta válida.');
                return;
            }

            if (resData.error && resData.error !== false) {
                setErrorMsg(resData.result || 'Error al cargar los productos.');
                setProducts([]);
                return;
            }

            setProducts(Array.isArray(resData.result) ? resData.result : []);
        } catch (err) {
            setErrorMsg('Error de comunicación con el backend.');
        } finally {
            setLoading(false);
        }
    };

    // Extraer marcas únicas para el filtro dropdown
    const brandsList = useMemo(() => {
        const brands = products
            .map(p => p.marca?.trim())
            .filter(brand => brand && brand !== '');
        return ['all', ...new Set(brands)];
    }, [products]);

    // Filtrado inteligente por Texto (SKU/SAP/Desc/Lab), Marca y Estatus Comercial
    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return products.filter((product) => {
            // Filtro por Marca
            if (selectedBrand !== 'all' && product.marca?.trim() !== selectedBrand) {
                return false;
            }
            // Filtro por Estatus (Activo/Inactivo en tu estructura)
            if (selectedStatus !== 'all') {
                const isProductActive = product.activo === 'Activo' || product.activo === true || product.activo === 1;
                if (selectedStatus === 'active' && !isProductActive) return false;
                if (selectedStatus === 'inactive' && isProductActive) return false;
            }

            if (!query) return true;

            const sap = product.codigo_sap || '';
            const sku = product.sku || '';
            const desc = product.descripcion || '';
            const lab = product.laboratorio || '';

            return sap.toLowerCase().includes(query) ||
                sku.toLowerCase().includes(query) ||
                desc.toLowerCase().includes(query) ||
                lab.toLowerCase().includes(query);
        });
    }, [products, searchTerm, selectedBrand, selectedStatus]);

    return (
        <div className="space-y-6">
            {/* Header de la sección */}
            <ProductHeader onRefresh={fetchProducts} loading={loading} />

            {/* Sistema de Mensajes */}
            <div className="max-w-7xl mx-auto">
                {errorMsg && (
                    <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm shadow-sm animate-fade-in">
                        <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                        <div>{errorMsg}</div>
                    </div>
                )}
                {successMsg && (
                    <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm shadow-sm animate-fade-in">
                        <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                        <div>{successMsg}</div>
                    </div>
                )}
            </div>

            {/* Barra superior de Filtros Avanzados */}
            <ProductFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                brandsList={brandsList}
                totalCount={filteredProducts.length}
            />

            {/* Rejilla Principal de Productos */}
            <ProductGridTable
                products={filteredProducts}
                loading={loading}
                searchTerm={searchTerm}
            />
        </div>
    );
}