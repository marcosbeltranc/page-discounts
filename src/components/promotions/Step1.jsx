'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const Field = ({ label, children }) => (<div className="space-y-1"> <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {label} </label>
    {children} </div>
);

export default function Step1({ data, onNext }) {
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
        discount_amount: '',
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
            });
        }
    }, [data]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEdit = !!data?.id;
        const url = isEdit
            ? `/promotions/update/${data.id}`
            : '/promotions/create';

        const method = isEdit ? api.put : api.post;

        try {
            const response = await method(url, form);
            onNext(response.result.id);
        } catch (err) {
            console.error(err);
            alert('Error al guardar la promoción');
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

                    <Field label="Tipo de Promoción">
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
                    </Field>
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
                                        discount_amount: e.target.value
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
