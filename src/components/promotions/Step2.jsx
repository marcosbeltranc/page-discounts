'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const Field = ({ label, children }) => (<div className="space-y-1"> <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {label} </label>
    {children} </div>
);

export default function Step2({ promotionId, onNext, data }) {
    console.log('data', data);
    const [groups, setGroups] = useState({
        users: [],
        products: []
    });

    const [allProducts, setAllProducts] = useState([]);

    const [rules, setRules] = useState([]);

    const [rule, setRule] = useState({
        id: null,
        promotion_id: promotionId,
        user_group_id: '',
        product_group_id: '',
        mix_products: false,
        product_id: '',
    });

    const [mode, setMode] = useState('sku'); // 'sku' o 'group'

    const handleMixChange = (e) => {
        const isChecked = e.target.checked;
        setRule({
            ...rule,
            mix_products: isChecked,
            product_group_id: isChecked ? rule.product_group_id : '',
            product_id: !isChecked ? rule.product_id : ''
        });

        // Si se marca, forzamos a grupo; si se desmarca, mantenemos el valor actual pero permitimos cambio
        if (isChecked) {
            setMode('group');
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!promotionId) return;

        const fetchResources = async () => {
            const [uRes, pRes, rRes, prodRes] = await Promise.all([
                api.get('/customer-groups'),
                api.get('/product-groups'),
                api.get(`/promotion-rules?promotion_id=${promotionId}`),
                api.get('/products')
            ]);

            setGroups({
                users: uRes.result || [],
                products: pRes.result || []
            });

            setAllProducts(prodRes.result || []);

            setRules(rRes.result || []);
        };

        fetchResources();
    }, [promotionId]);

    const resetForm = () => {
        setRule({
            id: null,
            promotion_id: promotionId,
            user_group_id: '',
            product_group_id: '',
            mix_products: false,
            product_id: '',
        });
    };

    const filteredProducts = allProducts.filter(p =>
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async () => {
        const finalRule = {
            ...rule,
            mix_products: mode === 'group' ? rule.mix_products : false,
            product_group_id: mode === 'group' ? rule.product_group_id : null,
            product_id: mode === 'sku' ? rule.product_id : null
        };

        try {
            if (rule.id) {
                await api.put(`/promotion-rules/update/${rule.id}`, finalRule);
                setRules(rules.map(r => r.id === rule.id ? finalRule : r));
            } else {
                const res = await api.post('/promotion-rules/create', finalRule);
                setRules([...rules, res.result]);
            }
            resetForm();
        } catch (err) {
            console.error(err);
            alert('Error al guardar la regla');
        }
    };

    // const handleSave = async () => {

    //     const payload = { ...rule };

    //     if (payload.mix_products) {
    //         payload.product_id = null;
    //     } else {
    //         payload.product_group_id = null;
    //     }

    //     try {
    //         if (rule.id) {
    //             await api.put(
    //                 `/promotion-rules/update/${rule.id}`,
    //                 rule
    //             );

    //             setRules(
    //                 rules.map(r =>
    //                     r.id === rule.id ? rule : r
    //                 )
    //             );
    //         } else {
    //             const res = await api.post(
    //                 '/promotion-rules/create',
    //                 rule
    //             );

    //             setRules([
    //                 ...rules,
    //                 res.result
    //             ]);
    //         }

    //         resetForm();
    //     } catch (err) {
    //         console.error(err);
    //         alert('Error al guardar la regla');
    //     }
    // };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta regla?')) return;

        try {
            await api.delete(
                `/promotion-rules/delete/${id}`
            );

            setRules(
                rules.filter(r => r.id !== id)
            );
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    return (
        <div className="space-y-6">

            {/* Reglas existentes */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">
                    Reglas Aplicadas
                </h2>

                {rules.length === 0 && (
                    <div className="p-6 border border-dashed rounded-xl text-center text-slate-500 text-sm">
                        No hay reglas configuradas.
                    </div>
                )}

                {rules.map((r, i) => {
                    const uGroup = groups.users.find(
                        g => g.id == r.user_group_id
                    );

                    const pGroup = groups.products.find(
                        g => g.id == r.product_group_id
                    );

                    return (
                        <div
                            key={r.id}
                            className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm"
                        >
                            <div>
                                <div className="font-semibold text-slate-800">
                                    Regla {i + 1}
                                </div>

                                <div className="text-sm text-slate-500">
                                    Clientes:
                                    <strong className="text-slate-700">
                                        {' '}
                                        {uGroup
                                            ? uGroup.group
                                            : 'Todos'}
                                    </strong>
                                </div>

                                <div className="text-sm text-slate-500">
                                    Productos:
                                    <strong className="text-slate-700">
                                        {' '}
                                        {r.product_group_id
                                            ? (pGroup ? pGroup.group : 'Grupo no encontrado')
                                            : (r.product_id
                                                ? (allProducts.find(p => p.id == r.product_id)?.sku || 'Producto no encontrado')
                                                : 'Todos'
                                            )
                                        }
                                    </strong>
                                </div>

                                {/* <div className="text-sm text-slate-500">
                                    Productos:
                                    <strong className="text-slate-700">
                                        {' '}
                                        {r.mix_products
                                            ? (pGroup ? pGroup.group : 'Todos')
                                            : (allProducts.find(p => p.id == r.product_id)?.sku || 'Producto no encontrado')
                                        }
                                    </strong>
                                </div> */}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setRule(r);

                                        // 1. Determinamos el modo basándonos en qué dato tiene valor real
                                        // Si hay un product_group_id, el modo es 'group', de lo contrario es 'sku'
                                        setMode(r.product_group_id ? 'group' : 'sku');

                                        // 2. Si es SKU, buscamos el SKU para el input, de lo contrario limpiamos el buscador
                                        setSearchTerm(r.product_id ? (allProducts.find(p => p.id == r.product_id)?.sku || '') : '');
                                    }}
                                    className="text-indigo-600 font-medium hover:underline"
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="text-red-500 font-medium hover:underline"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Formulario */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-bold text-slate-800">
                    {rule.id
                        ? 'Editar Regla'
                        : 'Nueva Regla'}
                </h3>


                {/* Selector 1: Tipo de selección */}
                <Field label="Tipo de Selección">
                    <select
                        value={mode}
                        disabled={rule.mix_products} // Se bloquea si el checkbox está marcado
                        className="w-full p-3 border rounded-xl disabled:bg-slate-100 disabled:text-slate-400"
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <option value="sku">Producto individual (SKU)</option>
                        <option value="group">Grupo de productos</option>
                    </select>
                </Field>

                {/* Selección de modo Mix */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={rule.mix_products}
                        onChange={handleMixChange}
                    />
                    <span className="text-sm">¿Se pueden mezclar productos en la regla?</span>
                </div>

                {mode === 'group' ? (
                    <Field label="Grupo de Productos">
                        <select
                            value={rule.product_group_id}
                            className="w-full p-3 border rounded-xl"
                            onChange={(e) => setRule({ ...rule, product_group_id: e.target.value })}
                        >
                            <option value="">Selecciona un grupo</option>
                            {groups.products.map(g => <option key={g.id} value={g.id}>{g.group}</option>)}
                        </select>
                    </Field>
                ) : (
                    <Field label="Buscar Producto por SKU">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Escribe el SKU..."
                                className="w-full p-3 border rounded-xl mb-2"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                            />
                            {searchTerm && showDropdown && (
                                <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                    {filteredProducts.map(p => (
                                        <div
                                            key={p.id}
                                            className="p-3 hover:bg-indigo-50 cursor-pointer text-sm"
                                            onClick={() => {
                                                setRule({ ...rule, product_id: p.id });
                                                setSearchTerm(p.sku);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <span className="font-bold">{p.sku}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Field>
                )}

                <Field label="Grupo de Clientes">
                    <select
                        value={rule.user_group_id}
                        className="w-full p-3 border rounded-xl"
                        onChange={(e) =>
                            setRule({
                                ...rule,
                                user_group_id:
                                    e.target.value
                            })
                        }
                    >
                        {groups.users.map(g => (
                            <option
                                key={g.id}
                                value={g.id}
                            >
                                {g.group}
                            </option>
                        ))}
                    </select>
                </Field>


                {/* <Field label="Grupo de Productos">
                    <select
                        value={rule.product_group_id}
                        className="w-full p-3 border rounded-xl"
                        onChange={(e) =>
                            setRule({
                                ...rule,
                                product_group_id:
                                    e.target.value
                            })
                        }
                    >
                        <option value="">
                            Todos los productos
                        </option>

                        {groups.products.map(g => (
                            <option
                                key={g.id}
                                value={g.id}
                            >
                                {g.group}
                            </option>
                        ))}
                    </select>
                </Field> */}

                <button
                    onClick={handleSave}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-sm font-bold transition"
                >
                    {rule.id
                        ? 'Guardar Cambios'
                        : '+ Agregar Regla'}
                </button>

                {rule.id && (
                    <button
                        onClick={resetForm}
                        className="w-full text-slate-500 text-sm hover:underline"
                    >
                        Cancelar edición
                    </button>
                )}
            </div>

            {/* Navegación */}
            <button
                onClick={onNext}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition"
            >
                Continuar a Acciones
            </button>
        </div>
    );

}
