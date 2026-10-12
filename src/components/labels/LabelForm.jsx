'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Tag } from 'lucide-react';

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
        </label>
        {children}
    </div>
);

const INITIAL_FORM = {
    name: '',
    slug: '',
    background_color: '#e2e8f0',
    text_color: '#0f172a',
    product_id: '',
    product_group_id: '',
    ranking: 0,
    is_active: true
};

const isValidHexColor = (color) => /^#[0-9A-Fa-f]{6}$/.test(String(color || ''));

const getContrastColor = (hexColor) => {
    if (!isValidHexColor(hexColor)) return '#0f172a';
    const hex = hexColor.replace('#', '');
    const red = parseInt(hex.substring(0, 2), 16);
    const green = parseInt(hex.substring(2, 4), 16);
    const blue = parseInt(hex.substring(4, 6), 16);
    const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
    return luminance > 150 ? '#0f172a' : '#ffffff';
};

export default function LabelForm({ labelData, onCancel, onFinish }) {
    const isEdit = !!labelData?.id;
    const [form, setForm] = useState(INITIAL_FORM);

    // Estados para la asignación
    const [assignmentMode, setAssignmentMode] = useState('none'); // 'none', 'product', 'group'
    const [productGroups, setProductGroups] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Cargar recursos para asignación
        const fetchResources = async () => {
            try {
                const [groupsRes, productsRes] = await Promise.all([
                    api.get('/product-groups'),
                    api.get('/products')
                ]);
                setProductGroups(groupsRes.result || []);
                setAllProducts(productsRes.result || []);
            } catch (error) {
                console.error("Error cargando recursos", error);
            }
        };
        fetchResources();
    }, []);

    useEffect(() => {
        if (!labelData) {
            setForm(INITIAL_FORM);
            setAssignmentMode('none');
            setSearchTerm('');
            return;
        }

        setForm({
            name: labelData.name ?? '',
            slug: labelData.slug ?? '',
            background_color: labelData.background_color ?? '#e2e8f0',
            text_color: labelData.text_color ?? '#0f172a',
            product_id: labelData.product_id ?? '',
            product_group_id: labelData.product_group_id ?? '',
            ranking: labelData.ranking ?? 0,
            is_active: labelData.is_active ?? true
        });

        // Determinar modo de asignación inicial
        if (labelData.product_group_id) {
            setAssignmentMode('group');
        } else if (labelData.product_id) {
            setAssignmentMode('product');
        } else {
            setAssignmentMode('none');
        }
    }, [labelData]);

    // Establecer el searchTerm si estamos en edición y hay un producto asignado, 
    // pero esperar a que allProducts esté cargado
    useEffect(() => {
        if (isEdit && form.product_id && allProducts.length > 0 && assignmentMode === 'product') {
            const prod = allProducts.find(p => p.id == form.product_id);
            if (prod) setSearchTerm(prod.sku);
        }
    }, [isEdit, form.product_id, allProducts, assignmentMode]);

    const filteredProducts = allProducts.filter(p =>
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error('El nombre de la etiqueta es obligatorio');
            return;
        }

        if (!form.slug.trim()) {
            toast.error('El slug de la etiqueta es obligatorio');
            return;
        }

        if (!isValidHexColor(form.background_color) || !isValidHexColor(form.text_color)) {
            toast.error('Los colores deben usar formato hexadecimal válido (ej. #RRGGBB)');
            return;
        }

        if (assignmentMode === 'group' && !form.product_group_id) {
            toast.error('Debe seleccionar un grupo de productos');
            return;
        }

        if (assignmentMode === 'product' && !form.product_id) {
            toast.error('Debe seleccionar un producto');
            return;
        }

        if (assignmentMode === 'none') {
            toast.error('Debe seleccionar un producto o grupo de producto');
            return;
        }


        // Limpiar IDs según el modo de asignación
        const payload = {
            ...form,
            product_id: assignmentMode === 'product' ? form.product_id || null : null,
            product_group_id: assignmentMode === 'group' ? form.product_group_id || null : null,
        };

        const url = isEdit ? `/labels/update/${labelData.id}` : '/labels/create';
        const method = isEdit ? api.put : api.post;

        try {
            const response = await method(url, payload);
            if (response.error) {
                toast.error(response.result || 'Error al guardar la etiqueta');
                return;
            }
            toast.success(isEdit ? 'Etiqueta actualizada' : 'Etiqueta creada exitosamente');
            onFinish();
        } catch (err) {
            console.error(err);
            toast.error('Ocurrió un error al guardar la etiqueta');
        }
    };

    const previewBgColor = isValidHexColor(form.background_color) ? form.background_color : '#e2e8f0';
    const previewTextColor = isValidHexColor(form.text_color) ? form.text_color : getContrastColor(previewBgColor);

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">
                {isEdit ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Configuración Visual y General */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Diseño e Información</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nombre">
                            <input
                                type="text"
                                maxLength={50}
                                placeholder="Ej. Nuevo, Destacado"
                                className="w-full p-3 border rounded-xl bg-white focus:border-indigo-500 outline-none"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </Field>

                        <Field label="Slug (URL Amigable)">
                            <input
                                type="text"
                                placeholder="ej-etiqueta-nueva"
                                className="w-full p-3 border rounded-xl bg-white focus:border-indigo-500 outline-none"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Color de fondo">
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="w-12 h-12 p-1 rounded-xl cursor-pointer"
                                    value={previewBgColor}
                                    onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                                />
                                <input
                                    type="text"
                                    maxLength={7}
                                    className="min-w-0 w-full p-3 border rounded-xl bg-white font-mono uppercase focus:border-indigo-500 outline-none"
                                    value={form.background_color}
                                    onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                                />
                            </div>
                        </Field>

                        <Field label="Color de texto">
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="w-12 h-12 p-1 rounded-xl cursor-pointer"
                                    value={previewTextColor}
                                    onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                                />
                                <input
                                    type="text"
                                    maxLength={7}
                                    className="min-w-0 w-full p-3 border rounded-xl bg-white font-mono uppercase focus:border-indigo-500 outline-none"
                                    value={form.text_color}
                                    onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                                />
                            </div>
                        </Field>
                    </div>

                    <Field label="Vista Previa">
                        <div className="h-16 flex items-center justify-center bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)', backgroundSize: '10px 10px' }}>
                            <span
                                className="inline-flex max-w-full items-center px-4 py-1.5 text-sm font-bold border border-black/10 rounded-lg truncate shadow-sm transition-colors"
                                style={{ backgroundColor: previewBgColor, color: previewTextColor }}
                            >
                                <Tag size={14} className="mr-1.5 opacity-80" />
                                {form.name.trim() || 'Ejemplo de Etiqueta'}
                            </span>
                        </div>
                    </Field>
                </div>

                {/* Asignación y Comportamiento */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
                    <h2 className="text-lg font-bold text-indigo-800 mb-2">Reglas de Asignación</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* <Field label="Ranking (Prioridad)">
                            <input
                                type="number"
                                className="w-full p-3 border rounded-xl bg-white focus:border-indigo-500 outline-none"
                                value={form.ranking}
                                onChange={(e) => setForm({ ...form, ranking: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Mayor número = mayor prioridad visual</p>
                        </Field> */}

                        {/* <Field label="Estado">
                            <div className="h-full flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-indigo-600 rounded border-slate-300"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-slate-700">
                                        Etiqueta Activa
                                    </span>
                                </label>
                            </div>
                        </Field> */}
                    </div>

                    <Field label="Tipo de Asignación">
                        <select
                            value={assignmentMode}
                            onChange={(e) => {
                                setAssignmentMode(e.target.value);
                                if (e.target.value === 'none') {
                                    setForm({ ...form, product_id: '', product_group_id: '' });
                                } else if (e.target.value === 'product') {
                                    setForm({ ...form, product_group_id: '' });
                                } else if (e.target.value === 'group') {
                                    setForm({ ...form, product_id: '' });
                                    setSearchTerm('');
                                }
                            }}
                            className="w-full p-3 border rounded-xl bg-white focus:border-indigo-500 outline-none"
                        >
                            <option value="none">Seleccionar modo de asignación</option>
                            <option value="product">Producto Específico (SKU)</option>
                            <option value="group">Grupo de Productos</option>
                        </select>
                    </Field>

                    {assignmentMode === 'group' && (
                        <Field label="Seleccionar Grupo de Productos">
                            <select
                                value={form.product_group_id}
                                className="w-full p-3 border rounded-xl bg-white focus:border-indigo-500 outline-none"
                                onChange={(e) => setForm({ ...form, product_group_id: e.target.value })}
                            >
                                <option value="">Selecciona un grupo...</option>
                                {productGroups.map(g => (
                                    <option key={g.id} value={g.id}>{g.group || g.name}</option>
                                ))}
                            </select>
                        </Field>
                    )}

                    {assignmentMode === 'product' && (
                        <Field label="Buscar Producto por SKU">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Escribe el SKU..."
                                    className="w-full p-3 border rounded-xl bg-white focus:border-indigo-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                        if (e.target.value === '') setForm({ ...form, product_id: '' });
                                    }}
                                />
                                {searchTerm && showDropdown && (
                                    <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto mt-1">
                                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                            <div
                                                key={p.id}
                                                className="p-3 hover:bg-indigo-50 cursor-pointer text-sm transition-colors"
                                                onClick={() => {
                                                    setForm({ ...form, product_id: p.id });
                                                    setSearchTerm(p.sku);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <span className="font-bold text-indigo-700">{p.sku}</span>
                                                <span className="ml-2 text-slate-500 text-xs">{p.name}</span>
                                            </div>
                                        )) : (
                                            <div className="p-3 text-sm text-slate-500">No se encontraron productos</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Field>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-1/3 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 py-4 rounded-xl font-bold transition cursor-pointer"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition shadow-sm cursor-pointer"
                    >
                        Guardar Etiqueta
                    </button>
                </div>
            </form>
        </div>
    );
}