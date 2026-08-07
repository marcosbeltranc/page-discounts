'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

const Field = ({ label, children }) => (<div className="space-y-1"> <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {label} </label>
    {children} </div>
);

const INITIAL_FORM = {
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
    active: true,
    tags: []
};

const isValidHexColor = (color) =>
    /^#[0-9A-Fa-f]{6}$/.test(String(color || ''));

const normalizeTags = (tags) => {
    if (Array.isArray(tags)) return tags;

    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

const getContrastColor = (hexColor) => {
    if (!isValidHexColor(hexColor)) return '#0f172a';

    const hex = hexColor.replace('#', '');
    const red = parseInt(hex.substring(0, 2), 16);
    const green = parseInt(hex.substring(2, 4), 16);
    const blue = parseInt(hex.substring(4, 6), 16);
    const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

    return luminance > 150 ? '#0f172a' : '#ffffff';
};

const createTagKey = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `tag-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeFormData = (data = {}) => ({
    ...INITIAL_FORM,
    ...data,
    name: data.name ?? '',
    description: data.description ?? '',
    code: data.code ?? '',
    type: data.type ?? 'discount',
    start_at: data.start_at ? String(data.start_at).substring(0, 16) : '',
    end_at: data.end_at ? String(data.end_at).substring(0, 16) : '',
    usage_limit: data.usage_limit ?? '',
    min_amount: data.min_amount ?? 0,
    min_quantity: data.min_quantity ?? 1,
    is_combinable: Boolean(data.is_combinable),
    include_tax: Boolean(data.include_tax),
    discount_type: data.discount_type ?? 'percentage',
    discount_amount: Number(data.discount_amount ?? 0),
    discount_limit: data.discount_limit ?? '',
    active: data.active == null ? true : Boolean(data.active),
    tags: normalizeTags(data.tags).map(tag => {
        const backgroundColor = isValidHexColor(tag?.color)
            ? tag.color
            : '#f0f0f0';

        return {
            _key: tag?._key ?? createTagKey(),
            label: tag?.label ?? '',
            color: tag?.color ?? '#f0f0f0',
            textcolor: isValidHexColor(tag?.textcolor)
                ? tag.textcolor
                : getContrastColor(backgroundColor)
        };
    })
});

export default function Step1({ data, onNext }) {
    const isEdit = !!data?.id;

    const [form, setForm] = useState(INITIAL_FORM);
    const [draggedTagIndex, setDraggedTagIndex] = useState(null);
    const [dragOverTagIndex, setDragOverTagIndex] = useState(null);

    // Carga los datos al editar y normaliza el JSON de etiquetas.
    useEffect(() => {
        if (!data) {
            setForm(INITIAL_FORM);
            return;
        }

        setForm(normalizeFormData(data));
    }, [data]);

    const addTag = () => {
        setForm(current => ({
            ...current,
            tags: [
                ...normalizeTags(current.tags),
                {
                    _key: createTagKey(),
                    label: '',
                    color: '#f0f0f0',
                    textcolor: '#0f172a'
                }
            ]
        }));
    };

    const updateTag = (index, field, value) => {
        setForm(current => ({
            ...current,
            tags: normalizeTags(current.tags).map((tag, tagIndex) =>
                tagIndex === index
                    ? { ...tag, [field]: value }
                    : tag
            )
        }));
    };

    const removeTag = (index) => {
        setForm(current => ({
            ...current,
            tags: normalizeTags(current.tags).filter(
                (_, tagIndex) => tagIndex !== index
            )
        }));
    };

    const resetTagDragState = () => {
        setDraggedTagIndex(null);
        setDragOverTagIndex(null);
    };

    const handleTagDragStart = (event, index) => {
        setDraggedTagIndex(index);
        setDragOverTagIndex(index);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
    };

    const handleTagDragOver = (event, index) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        if (dragOverTagIndex !== index) {
            setDragOverTagIndex(index);
        }
    };

    const handleTagDrop = (event, targetIndex) => {
        event.preventDefault();

        const transferredIndex = Number(event.dataTransfer.getData('text/plain'));
        const sourceIndex = Number.isInteger(draggedTagIndex)
            ? draggedTagIndex
            : transferredIndex;

        if (!Number.isInteger(sourceIndex) || sourceIndex === targetIndex) {
            resetTagDragState();
            return;
        }

        setForm(current => {
            const tags = [...normalizeTags(current.tags)];

            if (!tags[sourceIndex] || !tags[targetIndex]) {
                return current;
            }

            const [movedTag] = tags.splice(sourceIndex, 1);
            tags.splice(targetIndex, 0, movedTag);

            return {
                ...current,
                tags
            };
        });

        resetTagDragState();
    };

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

        const normalizedTags = normalizeTags(form.tags).map(tag => ({
            label: String(tag?.label || '').trim(),
            color: String(tag?.color || '').trim(),
            textcolor: String(tag?.textcolor || '').trim()
        }));

        if (normalizedTags.some(tag => !tag.label)) {
            toast.error('Todas las etiquetas deben tener un nombre');
            return;
        }

        if (normalizedTags.some(tag => !isValidHexColor(tag.color))) {
            toast.error('El color de fondo de cada etiqueta debe usar el formato hexadecimal #RRGGBB');
            return;
        }

        if (normalizedTags.some(tag => !isValidHexColor(tag.textcolor))) {
            toast.error('El color de texto de cada etiqueta debe usar el formato hexadecimal #RRGGBB');
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
            tags: normalizedTags.length > 0 ? normalizedTags : null,
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
                        value={form.name ?? ''}
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
                        value={form.description ?? ''}
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
                            value={form.usage_limit ?? ''}
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
                            value={form.type ?? 'discount'}
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
                            value={form.start_at ?? ''}
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
                            value={form.end_at ?? ''}
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

            {/* Etiquetas promocionales */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Etiquetas
                        </h2>
                        <p className="text-xs text-slate-500">
                            Agrega textos cortos para destacar la promoción, por ejemplo 10+1 o 10%.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={addTag}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-bold hover:bg-indigo-100 transition"
                    >
                        <Plus size={16} />
                        Agregar etiqueta
                    </button>
                </div>

                {normalizeTags(form.tags).length === 0 && (
                    <div className="p-5 border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-500">
                        Esta promoción no tiene etiquetas.
                    </div>
                )}

                {normalizeTags(form.tags).length > 1 && (
                    <p className="text-xs text-slate-500">
                        Arrastra cada etiqueta desde el manejador para cambiar el orden que tendrá dentro del JSON.
                    </p>
                )}

                <div className="space-y-3">
                    {normalizeTags(form.tags).map((tag, index) => {
                        const previewColor = isValidHexColor(tag.color)
                            ? tag.color
                            : '#f0f0f0';
                        const previewTextColor = isValidHexColor(tag.textcolor)
                            ? tag.textcolor
                            : getContrastColor(previewColor);
                        const isDragging = draggedTagIndex === index;
                        const isDragTarget = dragOverTagIndex === index
                            && draggedTagIndex !== null
                            && draggedTagIndex !== index;

                        return (
                            <div
                                key={tag._key ?? `${tag.label}-${index}`}
                                onDragOver={(event) => handleTagDragOver(event, index)}
                                onDrop={(event) => handleTagDrop(event, index)}
                                className={`flex gap-3 p-4 border rounded-xl bg-slate-50 transition ${isDragging
                                    ? 'opacity-50 border-indigo-300'
                                    : isDragTarget
                                        ? 'border-indigo-500 ring-2 ring-indigo-100'
                                        : 'border-slate-200'
                                    }`}
                            >
                                <div className="pt-6">
                                    <div
                                        draggable
                                        onDragStart={(event) => handleTagDragStart(event, index)}
                                        onDragEnd={resetTagDragState}
                                        className="h-12 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-300 cursor-grab active:cursor-grabbing select-none"
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Arrastrar etiqueta ${index + 1}`}
                                        title="Arrastra para cambiar el orden"
                                    >
                                        <GripVertical size={18} />
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1 grid grid-cols-1 xl:grid-cols-[minmax(180px,1fr)_180px_180px_160px_auto] gap-3 items-end">
                                    <Field label={`Etiqueta ${index + 1}`}>
                                        <input
                                            type="text"
                                            maxLength={50}
                                            placeholder="Ej. 10+1"
                                            className="w-full p-3 border rounded-xl bg-white"
                                            value={tag.label ?? ''}
                                            onChange={(e) =>
                                                updateTag(index, 'label', e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Color de fondo">
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                aria-label={`Seleccionar color de fondo de etiqueta ${index + 1}`}
                                                className="w-12 h-12 p-1 border rounded-xl bg-white cursor-pointer"
                                                value={previewColor}
                                                onChange={(e) =>
                                                    updateTag(index, 'color', e.target.value)
                                                }
                                            />

                                            <input
                                                type="text"
                                                maxLength={7}
                                                placeholder="#f0f0f0"
                                                className="min-w-0 w-full p-3 border rounded-xl bg-white font-mono uppercase"
                                                value={tag.color ?? ''}
                                                onChange={(e) =>
                                                    updateTag(index, 'color', e.target.value)
                                                }
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Color de texto">
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                aria-label={`Seleccionar color de texto de etiqueta ${index + 1}`}
                                                className="w-12 h-12 p-1 border rounded-xl bg-white cursor-pointer"
                                                value={previewTextColor}
                                                onChange={(e) =>
                                                    updateTag(index, 'textcolor', e.target.value)
                                                }
                                            />

                                            <input
                                                type="text"
                                                maxLength={7}
                                                placeholder="#0f172a"
                                                className="min-w-0 w-full p-3 border rounded-xl bg-white font-mono uppercase"
                                                value={tag.textcolor ?? ''}
                                                onChange={(e) =>
                                                    updateTag(index, 'textcolor', e.target.value)
                                                }
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Vista previa">
                                        <div className="h-12 flex items-center">
                                            <span
                                                className="inline-flex max-w-full items-center px-3 py-1.5 rounded-full text-xs font-bold border border-black/10 truncate"
                                                style={{
                                                    backgroundColor: previewColor,
                                                    color: previewTextColor
                                                }}
                                            >
                                                {tag.label?.trim() || 'Etiqueta'}
                                            </span>
                                        </div>
                                    </Field>

                                    <button
                                        type="button"
                                        onClick={() => removeTag(index)}
                                        className="h-12 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                                        aria-label={`Eliminar etiqueta ${index + 1}`}
                                    >
                                        <Trash2 size={16} />
                                        <span className="xl:hidden">Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-bold text-indigo-700">
                    Configuración de Descuento
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Tipo de Descuento">
                        <select
                            className="w-full p-3 border rounded-xl"
                            value={form.discount_type ?? 'percentage'}
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
                            value={form.discount_amount ?? 0}
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
                            value={form.discount_limit ?? ''}
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
                        checked={Boolean(form.include_tax)}
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
                            value={form.min_quantity ?? 1}
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
                            value={form.min_amount ?? 0}
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
                            checked={Boolean(form.is_combinable)}
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