'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const Field = ({ label, children }) => (<div className="space-y-1"> <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {label} </label>
    {children} </div>
);

export default function Step2({ promotionId, onNext }) {
    const [groups, setGroups] = useState({
        users: [],
        products: []
    });


    const [rules, setRules] = useState([]);

    const [rule, setRule] = useState({
        id: null,
        promotion_id: promotionId,
        user_group_id: '',
        product_group_id: ''
    });

    useEffect(() => {
        if (!promotionId) return;

        const fetchResources = async () => {
            const [uRes, pRes, rRes] = await Promise.all([
                api.get('/customer-groups'),
                api.get('/product-groups'),
                api.get(`/promotion-rules?promotion_id=${promotionId}`)
            ]);

            setGroups({
                users: uRes.result || [],
                products: pRes.result || []
            });

            setRules(rRes.result || []);
        };

        fetchResources();
    }, [promotionId]);

    const resetForm = () => {
        setRule({
            id: null,
            promotion_id: promotionId,
            user_group_id: '',
            product_group_id: ''
        });
    };

    const handleSave = async () => {
        try {
            if (rule.id) {
                await api.put(
                    `/promotion-rules/update/${rule.id}`,
                    rule
                );

                setRules(
                    rules.map(r =>
                        r.id === rule.id ? rule : r
                    )
                );
            } else {
                const res = await api.post(
                    '/promotion-rules/create',
                    rule
                );

                setRules([
                    ...rules,
                    res.result
                ]);
            }

            resetForm();
        } catch (err) {
            console.error(err);
            alert('Error al guardar la regla');
        }
    };

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
                                        {pGroup
                                            ? pGroup.group
                                            : 'Todos'}
                                    </strong>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setRule(r)}
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
                        <option value="">
                            Todos los clientes
                        </option>

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

                <Field label="Grupo de Productos">
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
                </Field>

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
