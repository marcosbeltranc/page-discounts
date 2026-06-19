'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const Field = ({ label, children }) => (<div className="space-y-1"> <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {label} </label>
    {children} </div>
);

export default function Step3({ promotionId, onFinish }) {
    const [groups, setGroups] = useState({
        products: [],
        gifts: []
    });

    const [actions, setActions] = useState([]);

    const [action, setAction] = useState({
        id: null,
        promotion_id: promotionId,
        operation_type: 'DISCOUNT',
        target_type: 'product_group',
        applicable_to: '',
        only_in_cart: true,
        is_lowest_price: false,
        items_to_add: 0
    });

    useEffect(() => {
        const fetchResources = async () => {
            const [pRes, gRes, aRes] = await Promise.all([
                api.get('/product-groups'),
                api.get('/promotional-product-groups'),
                api.get(`/promotion-actions?promotion_id=${promotionId}`)
            ]);

            setGroups({
                products: pRes.result || [],
                gifts: gRes.result || []
            });

            setActions(aRes.result || []);
        };

        fetchResources();
    }, [promotionId]);

    const resetForm = () => {
        setAction({
            id: null,
            promotion_id: promotionId,
            operation_type: 'DISCOUNT',
            target_type: 'product_group',
            applicable_to: '',
            only_in_cart: true,
            is_lowest_price: false,
            items_to_add: 0
        });
    };

    const handleSaveAction = async () => {
        const payload = { ...action };

        if (payload.operation_type === 'ADD_GIFT') {
            payload.only_in_cart = false;
            payload.is_lowest_price = false;
        }

        try {
            if (action.id) {
                await api.put(
                    `/promotion-actions/update/${action.id}`,
                    payload
                );

                setActions(
                    actions.map(a =>
                        a.id === action.id ? action : a
                    )
                );
            } else {
                const res = await api.post(
                    '/promotion-actions/create',
                    payload
                );

                setActions([
                    ...actions,
                    res.result
                ]);
            }

            resetForm();
        } catch (err) {
            console.error(err);
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta acción?')) return;

        try {
            await api.delete(
                `/promotion-actions/delete/${id}`
            );

            setActions(
                actions.filter(a => a.id !== id)
            );
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    const isDiscount =
        action.operation_type === 'DISCOUNT';
    const isGift =
        action.operation_type === 'ADD_GIFT';

    const isProduct =
        action.operation_type === 'ADD_PRODUCT';
    const getActionLabel = (type) => {
        switch (type) {
            case 'DISCOUNT':
                return 'Descuento';

            case 'ADD_PRODUCT':
                return 'Agregar Producto';

            case 'ADD_GIFT':
                return 'Agregar Regalo';

            default:
                return type;
        }
    };

    const getGroupName = (a) => {
        if (!a.applicable_to) {
            return 'No definido';
        }

        const source =
            a.target_type === 'gift_group'
                ? groups.gifts
                : groups.products;

        const group = source.find(
            g => String(g.id) === String(a.applicable_to)
        );

        return group?.group || `ID ${a.applicable_to}`;
    };

    return (
        <div className="space-y-6">

            {/* Acciones configuradas */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">
                    Acciones Configuradas
                </h2>

                {actions.length === 0 && (
                    <div className="p-6 border border-dashed rounded-xl text-center text-slate-500 text-sm">
                        No hay acciones configuradas.
                    </div>
                )}

                {actions.map((a, i) => (
                    <div
                        key={a.id}
                        className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm"
                    >
                        <div>
                            <div className="font-semibold text-slate-800">
                                Acción {i + 1}
                            </div>

                            <div className="text-sm text-slate-500">
                                Tipo:
                                <strong className="text-slate-700">
                                    {' '}
                                    {getActionLabel(a.operation_type)}
                                </strong>
                            </div>

                            {!(
                                a.operation_type === 'DISCOUNT'
                            ) && (
                                    <>
                                        <div className="text-sm text-slate-500">
                                            Grupo:
                                            <strong className="text-slate-700">
                                                {' '}
                                                {getGroupName(a)}
                                            </strong>
                                        </div>

                                        <div className="text-sm text-slate-500">
                                            Cantidad:
                                            <strong className="text-slate-700">
                                                {' '}
                                                {a.items_to_add}
                                            </strong>
                                        </div>
                                    </>
                                )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setAction(a)}
                                className="text-indigo-600 font-medium hover:underline"
                            >
                                Editar
                            </button>

                            <button
                                onClick={() =>
                                    handleDelete(a.id)
                                }
                                className="text-red-500 font-medium hover:underline"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Formulario */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-bold text-slate-800">
                    {action.id
                        ? 'Editar Acción'
                        : 'Nueva Acción'}
                </h3>

                <Field label="Tipo de Acción">
                    <select
                        value={action.operation_type}
                        className="w-full p-3 border rounded-xl"
                        onChange={(e) => {
                            const operationType = e.target.value;

                            setAction({
                                ...action,
                                operation_type: operationType,
                                target_type:
                                    operationType === 'ADD_GIFT'
                                        ? 'gift_group'
                                        : 'product_group',
                                applicable_to: '',

                                only_in_cart:
                                    operationType === 'ADD_GIFT'
                                        ? false
                                        : action.only_in_cart,

                                is_lowest_price:
                                    operationType === 'ADD_GIFT'
                                        ? false
                                        : action.is_lowest_price
                            });
                        }}
                    >
                        <option value="DISCOUNT">
                            Descuento
                        </option>

                        <option value="ADD_PRODUCT">
                            Agregar Producto
                        </option>

                        <option value="ADD_GIFT">
                            Agregar Regalo
                        </option>
                    </select>
                </Field>

                {!isDiscount && (
                    <>
                        <Field
                            label={
                                action.operation_type ===
                                    'ADD_GIFT'
                                    ? 'Grupo de Regalos'
                                    : 'Grupo de Productos'
                            }
                        >
                            <select
                                value={action.applicable_to}
                                className="w-full p-3 border rounded-xl"
                                onChange={(e) =>
                                    setAction({
                                        ...action,
                                        applicable_to:
                                            e.target.value
                                    })
                                }
                            >
                                <option value="">
                                    Selecciona un grupo
                                </option>

                                {(action.target_type ===
                                    'gift_group'
                                    ? groups.gifts
                                    : groups.products
                                ).map(g => (
                                    <option
                                        key={g.id}
                                        value={g.id}
                                    >
                                        {g.group}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Cantidad a Agregar">
                            <input
                                type="number"
                                min="1"
                                className="w-full p-3 border rounded-xl"
                                value={action.items_to_add}
                                onChange={(e) =>
                                    setAction({
                                        ...action,
                                        items_to_add:
                                            e.target.value
                                    })
                                }
                            />
                        </Field>

                        {isProduct && (
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={action.only_in_cart}
                                        onChange={(e) =>
                                            setAction({
                                                ...action,
                                                only_in_cart:
                                                    e.target.checked
                                            })
                                        }
                                    />

                                    Aplicar únicamente a productos presentes en el carrito
                                </label>

                                <label className="flex items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={action.is_lowest_price}
                                        onChange={(e) =>
                                            setAction({
                                                ...action,
                                                is_lowest_price:
                                                    e.target.checked
                                            })
                                        }
                                    />

                                    Aplicar sobre el producto de menor precio
                                </label>
                            </div>
                        )}
                    </>
                )}

                <button
                    onClick={handleSaveAction}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-sm font-bold transition"
                >
                    {action.id
                        ? 'Guardar Cambios'
                        : '+ Agregar Acción'}
                </button>

                {action.id && (
                    <button
                        onClick={resetForm}
                        className="w-full text-slate-500 text-sm hover:underline"
                    >
                        Cancelar edición
                    </button>
                )}
            </div>

            <button
                onClick={onFinish}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition"
            >
                Finalizar Promoción
            </button>
        </div>
    );

}
