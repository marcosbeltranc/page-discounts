'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Field = ({ label, children }) => (<div className="space-y-1"> <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {label} </label>
    {children} </div>
);

export default function Step1({ data, onNext }) {
    const isEdit = !!data?.id;

    const [form, setForm] = useState({
        name: '',
        description: '',
        code: '',
        type: 'discount',
        start_at: '',
        end_at: '',
        usage_limit: '',
        min_amount: 0,
        min_quantity: 1,
        is_combinable: false,
        include_tax: false,
        discount_type: 'percentage',
        discount_amount: 0,
        discount_limit: '',
        active: true
    });

    // 3. Usa useEffect para actualizar el estado cuando 'data' cambie
    useEffect(() => {
        if (data) {
            setForm({
                ...data,
                start_at: data.start_at ? data.start_at.substring(0, 16) : '',
                end_at: data.end_at ? data.end_at.substring(0, 16) : '',
                discount_amount: Number(data.discount_amount || 0),
            });
        }
    }, [data]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validaciones
        const now = new Date();
        const start = new Date(form.start_at);
        const end = new Date(form.end_at);

        if (!form.name || !form.start_at || !form.end_at) {
            toast.error('El nombre y las fechas son obligatorios');
            return;
        }

        // if (start < now) {
        //     toast.error('La fecha de inicio no puede estar en el pasado');
        //     return;
        // }

        if (end <= start) {
            toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        const url = isEdit
            ? `/promotions/update/${data.id}`
            : '/promotions/create';

        const method = isEdit ? api.put : api.post;

        // Toda promoción nueva se crea inactiva. No se activa hasta que
        // el wizard se completa (Paso 3), garantizando que nunca exista
        // una promoción activa sin reglas ni acciones configuradas.
        // En edición sí se permite alternar 'active' manualmente (checkbox),
        // ya que en ese caso la promoción ya pasó por el wizard completo.
        const payload = {
            ...form,
            active: isEdit ? Boolean(form.active) : false
        };

        try {
            const response = await method(url, payload);
            if (response.error) {
                toast.error(response.result);
                return;
            }

            const promotionId = response.result.id;
            const discountAmount = Number(form.discount_amount || 0);

            // 2. Busca si ya existe una action de tipo DISCOUNT para esta promoción
            //    (esto evita duplicarla en cada edit)
            let existingDiscountAction = null;

            if (isEdit) {
                try {
                    const actionsRes = await api.get(
                        `/promotion-actions?promotion_id=${promotionId}`
                    );

                    const existingActions = Array.isArray(actionsRes?.result)
                        ? actionsRes.result
                        : Array.isArray(actionsRes)
                            ? actionsRes
                            : [];

                    existingDiscountAction = existingActions.find(
                        (a) => a.operation_type === 'DISCOUNT'
                    ) || null;
                } catch (err) {
                    console.error(err);
                    console.warn('No se pudieron obtener las acciones existentes de la promoción.');
                }
            }

            if (discountAmount > 0) {
                const actionPayload = {
                    id: existingDiscountAction?.id ?? null,
                    promotion_id: promotionId,
                    operation_type: 'DISCOUNT',
                    target_type: 'discount',
                    applicable_to: null,
                    only_in_cart: false,
                    is_lowest_price: false,
                    items_to_add: 0
                };

                const ruleRes = existingDiscountAction
                    ? await api.put(
                        `/promotion-actions/update/${existingDiscountAction.id}`,
                        actionPayload
                    )
                    : await api.post('/promotion-actions/create', actionPayload);

                if (ruleRes.error) {
                    console.warn('La promoción se guardó, pero hubo un problema al guardar la regla automática.');
                }
            } else if (existingDiscountAction) {
                // 3. Si el descuento se puso en 0, elimina la action asociada
                try {
                    await api.delete(
                        `/promotion-actions/delete/${existingDiscountAction.id}`
                    );
                } catch (err) {
                    console.error(err);
                    console.warn('La promoción se guardó, pero hubo un problema al eliminar la regla automática.');
                }
            }

            onNext(response.result.id, { ...payload, ...response.result });
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar la promoción');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Información General */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-bold text-slate-800">
                    Información General
                </h2>

                <Field label="Nombre">
                    <input
                        className="w-full p-3 border rounded-xl"
                        value={form.name}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                name: e.target.value
                            })
                        }
                    />
                </Field>

                <Field label="Descripción">
                    <textarea
                        rows={3}
                        className="w-full p-3 border rounded-xl"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value
                            })
                        }
                    />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Código">
                        <input
                            className="w-full p-3 border rounded-xl"
                            value={form.code ?? ''}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    code: e.target.value
                                })
                            }
                        />
                    </Field>

                    <Field label="Límite de Usos">
                        <input
                            type="number"
                            className="w-full p-3 border rounded-xl"
                            value={form.usage_limit}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    usage_limit: e.target.value
                                })
                            }
                        />
                    </Field>
                    {/* <Field label="Tipo de Promoción">
                        <select
                            className="w-full p-3 border rounded-xl"
                            value={form.type}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    type: e.target.value
                                })
                            }
                        >
                            <option value="discount">
                                Descuento
                            </option>

                            <option value="gift">
                                Regalo
                            </option>

                            <option value="product">
                                Producto
                            </option>
                        </select>
                    </Field> */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Fecha y Hora de Inicio">
                        <input
                            type="datetime-local"
                            className="w-full p-3 border rounded-xl"
                            value={form.start_at}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    start_at: e.target.value
                                })
                            }
                        />
                    </Field>

                    <Field label="Fecha y Hora de Fin">
                        <input
                            type="datetime-local"
                            className="w-full p-3 border rounded-xl"
                            value={form.end_at}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    end_at: e.target.value
                                })
                            }
                        />
                    </Field>
                </div>
            </div>

            {/* Estado (solo disponible al editar, nunca en creación) */}
            {isEdit && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h2 className="text-lg font-bold text-slate-800">
                        Estado
                    </h2>

                    <label className="flex items-center gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={Boolean(form.active)}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    active: e.target.checked
                                })
                            }
                        />
                        Promoción activa
                    </label>

                    <p className="text-xs text-slate-500">
                        Controla si la promoción está activa de cara al cliente.
                        Las promociones nuevas siempre se crean inactivas hasta
                        completar los 3 pasos del wizard.
                    </p>
                </div>
            )}

            {/* Configuración de Descuento */}
            {form.type === 'discount' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
                    <h2 className="text-lg font-bold text-indigo-700">
                        Configuración de Descuento
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Tipo de Descuento">
                            <select
                                className="w-full p-3 border rounded-xl"
                                value={form.discount_type}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        discount_type: e.target.value
                                    })
                                }
                            >
                                <option value="percentage">
                                    Porcentaje (%)
                                </option>

                                <option value="fixed">
                                    Monto Fijo ($)
                                </option>
                            </select>
                        </Field>

                        <Field label="Monto del Descuento">
                            <input
                                type="number"
                                className="w-full p-3 border rounded-xl"
                                value={form.discount_amount}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        discount_amount: e.target.value === '' ? 0 : Number(e.target.value)
                                    })
                                }
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Límite de Descuento">
                            <input
                                type="number"
                                className="w-full p-3 border rounded-xl"
                                value={form.discount_limit}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        discount_limit: e.target.value
                                    })
                                }
                            />
                        </Field>

                    </div>

                    <label className="flex items-center gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={form.include_tax}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    include_tax: e.target.checked
                                })
                            }
                        />

                        Aplicar descuento sobre precios con impuestos
                    </label>
                </div>
            )}

            {/* Restricciones */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-bold text-slate-800">
                    Restricciones
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Cantidad Mínima">
                        <input
                            type="number"
                            className="w-full p-3 border rounded-xl"
                            value={form.min_quantity}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    min_quantity: e.target.value
                                })
                            }
                        />
                    </Field>

                    <Field label="Monto Mínimo">
                        <input
                            type="number"
                            className="w-full p-3 border rounded-xl"
                            value={form.min_amount}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    min_amount: e.target.value
                                })
                            }
                        />
                    </Field>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={form.is_combinable}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    is_combinable: e.target.checked
                                })
                            }
                        />

                        Permitir combinar con otras promociones
                    </label>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold transition"
            >
                Guardar y Continuar
            </button>
        </form>
    );

}