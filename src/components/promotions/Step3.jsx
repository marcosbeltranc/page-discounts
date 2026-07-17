'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
        </label>
        {children}
    </div>
);

const getResultArray = (res) => {
    if (Array.isArray(res?.result)) return res.result;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;

    return [];
};

const getItemSku = (item) => {
    return (
        item?.sku ??
        item?.SKU ??
        item?.code ??
        item?.item_code ??
        item?.product_code ??
        ''
    );
};

const getItemName = (item) => {
    return (
        item?.name ??
        item?.description ??
        item?.product_name ??
        item?.item_name ??
        item?.title ??
        'Sin nombre'
    );
};

const getTargetTypeByOperation = (operationType) => {
    switch (operationType) {
        case 'ADD_PRODUCT':
            return 'product';

        case 'ADD_GIFT':
            return 'gift';

        case 'ADD_GROUP_PRODUCTS':
            return 'product_group';

        case 'ADD_GROUP_GIFT':
            return 'gift_group';

        case 'DISCOUNT':
        default:
            return 'discount';
    }
};

const isGiftOperation = (operationType) => {
    return [
        'ADD_GIFT',
        'ADD_GROUP_GIFT'
    ].includes(operationType);
};

const isProductOperation = (operationType) => {
    return [
        'ADD_PRODUCT',
        'ADD_GROUP_PRODUCTS'
    ].includes(operationType);
};

const isIndividualOperation = (operationType) => {
    return [
        'ADD_PRODUCT',
        'ADD_GIFT'
    ].includes(operationType);
};

const isGroupOperation = (operationType) => {
    return [
        'ADD_GROUP_PRODUCTS',
        'ADD_GROUP_GIFT'
    ].includes(operationType);
};

// El monto se muestra como "10%" si es porcentaje, o "$10" si es monto fijo.
const formatDiscountValue = (amount, discountType) => {
    const value = Number(amount || 0);

    return discountType === 'percentage'
        ? `${value}%`
        : `$${value}`;
};

const getEmptyAction = (promotionId) => ({
    id: null,
    promotion_id: promotionId,
    operation_type: 'DISCOUNT',
    target_type: '',
    applicable_to: '',
    only_in_cart: true,
    is_lowest_price: true,
    items_to_add: 0
});

export default function Step3({ promotionId, onFinish, data }) {
    console.log('data step 3', data);
    const [groups, setGroups] = useState({
        products: [],
        gifts: []
    });

    const [items, setItems] = useState({
        products: [],
        gifts: []
    });

    const [actions, setActions] = useState([]);
    const [skuSearch, setSkuSearch] = useState('');

    const [action, setAction] = useState(
        getEmptyAction(promotionId)
    );

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [
                    productGroupsRes,
                    giftGroupsRes,
                    productsRes,
                    giftsRes,
                    actionsRes
                ] = await Promise.all([
                    api.get('/product-groups'),
                    api.get('/promotional-product-groups'),
                    api.get('/products'),
                    api.get('/promotional-products'),
                    api.get(`/promotion-actions?promotion_id=${promotionId}`)
                ]);

                setGroups({
                    products: getResultArray(productGroupsRes),
                    gifts: getResultArray(giftGroupsRes)
                });

                setItems({
                    products: getResultArray(productsRes),
                    gifts: getResultArray(giftsRes)
                });

                setActions(getResultArray(actionsRes));
            } catch (err) {
                console.error(err);
                alert('Error al cargar recursos de acciones');
            }
        };

        fetchResources();
    }, [promotionId]);

    const resetForm = () => {
        setAction(getEmptyAction(promotionId));
        setSkuSearch('');
    };

    const handleOperationChange = (operationType) => {
        const targetType = getTargetTypeByOperation(operationType);
        const isGift = isGiftOperation(operationType);
        const isProduct = isProductOperation(operationType);
        const isDiscount = operationType === 'DISCOUNT';
        console.log(operationType);
        setAction({
            ...action,
            operation_type: operationType,
            target_type: targetType,
            applicable_to: '',
            items_to_add: isDiscount ? 0 : 1,
            only_in_cart: isProduct ? action.only_in_cart : true,
            is_lowest_price: isProduct ? action.is_lowest_price : false
        });

        setSkuSearch('');
    };

    const handleSearchBySku = () => {
        const sku = skuSearch.trim();

        if (!sku) {
            alert('Ingresa un SKU para buscar');
            return;
        }

        const source =
            action.target_type === 'gift'
                ? items.gifts
                : items.products;

        const found = source.find(item =>
            String(getItemSku(item)).toLowerCase() === sku.toLowerCase()
        );

        if (!found) {
            alert('No se encontró un registro con ese SKU');
            return;
        }

        setAction({
            ...action,
            applicable_to: found.id
        });
    };

    const getSelectedItem = () => {
        if (!action.applicable_to) return null;

        const source =
            action.target_type === 'gift'
                ? items.gifts
                : items.products;

        return source.find(item =>
            String(item.id) === String(action.applicable_to)
        );
    };

    const handleSaveAction = async () => {
        console.log('action', action.operation_type);
        const targetType = getTargetTypeByOperation(action.operation_type);
        console.log('targetType', targetType);

        const payload = {
            ...action,
            promotion_id: promotionId,
            target_type: targetType || null,
            applicable_to: action.applicable_to || null,
            items_to_add: Number(action.items_to_add || 0)
        };

        console.log('operation_type', payload.operation_type);
        console.log('payload', payload);

        if (payload.operation_type !== 'DISCOUNT' && !payload.applicable_to) {
            alert('Selecciona o busca el producto/regalo/grupo que aplica');
            return;
        }

        if (payload.operation_type !== 'DISCOUNT' && payload.items_to_add < 1) {
            alert('La cantidad a agregar debe ser mínimo 1');
            return;
        }

        if (payload.operation_type === 'DISCOUNT') {
            payload.target_type = 'discount';
            payload.applicable_to = null;
            payload.items_to_add = 0;
            payload.only_in_cart = false;
            payload.is_lowest_price = false;
        }

        if (isGiftOperation(payload.operation_type)) {
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
                        a.id === action.id
                            ? {
                                ...payload,
                                id: action.id
                            }
                            : a
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

    const handleEdit = (selectedAction) => {
        const normalizedAction = {
            ...selectedAction,
            target_type:
                selectedAction.target_type ||
                getTargetTypeByOperation(selectedAction.operation_type),
            applicable_to: selectedAction.applicable_to ?? '',
            items_to_add: selectedAction.items_to_add ?? 0,
            only_in_cart: Boolean(selectedAction.only_in_cart),
            is_lowest_price: Boolean(selectedAction.is_lowest_price)
        };

        setAction(normalizedAction);

        const isIndividual = isIndividualOperation(
            normalizedAction.operation_type
        );

        if (isIndividual && normalizedAction.applicable_to) {
            const source =
                normalizedAction.target_type === 'gift'
                    ? items.gifts
                    : items.products;

            const found = source.find(item =>
                String(item.id) === String(normalizedAction.applicable_to)
            );

            setSkuSearch(found ? getItemSku(found) : '');
        } else {
            setSkuSearch('');
        }
    };

    const getActionLabel = (type) => {
        switch (type) {
            case 'DISCOUNT':
                return 'Descuento';

            case 'ADD_PRODUCT':
                return 'Agregar Producto Individual';

            case 'ADD_GIFT':
                return 'Agregar Regalo Individual';

            case 'ADD_GROUP_PRODUCTS':
                return 'Agregar Productos de Grupo';

            case 'ADD_GROUP_GIFT':
                return 'Agregar Regalos de Grupo';

            default:
                return type;
        }
    };

    const getTargetLabel = (targetType) => {
        switch (targetType) {
            case 'product':
                return 'Producto';

            case 'gift':
                return 'Regalo';

            case 'product_group':
                return 'Grupo de Productos';

            case 'gift_group':
                return 'Grupo de Regalos';

            default:
                return 'No aplica';
        }
    };

    const getTargetName = (a) => {
        if (!a.applicable_to) {
            return 'No definido';
        }

        if (a.target_type === 'product' || a.target_type === 'gift') {
            const source =
                a.target_type === 'gift'
                    ? items.gifts
                    : items.products;

            const item = source.find(
                p => String(p.id) === String(a.applicable_to)
            );

            if (!item) {
                return `ID ${a.applicable_to}`;
            }

            const sku = getItemSku(item);
            const name = getItemName(item);

            return sku
                ? `${name} - SKU: ${sku}`
                : name;
        }

        const source =
            a.target_type === 'gift_group'
                ? groups.gifts
                : groups.products;

        const group = source.find(
            g => String(g.id) === String(a.applicable_to)
        );

        return group?.group || group?.name || `ID ${a.applicable_to}`;
    };

    const isDiscount = action.operation_type === 'DISCOUNT';
    const isIndividual = isIndividualOperation(action.operation_type);
    const isGroup = isGroupOperation(action.operation_type);
    const showProductOptions = isProductOperation(action.operation_type);
    const selectedItem = getSelectedItem();

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

                            {a.operation_type !== 'DISCOUNT' && (
                                <>
                                    <div className="text-sm text-slate-500">
                                        Objetivo:
                                        <strong className="text-slate-700">
                                            {' '}
                                            {getTargetLabel(a.target_type)}
                                        </strong>
                                    </div>

                                    <div className="text-sm text-slate-500">
                                        Aplica a:
                                        <strong className="text-slate-700">
                                            {' '}
                                            {getTargetName(a)}
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
                            {a.operation_type === 'DISCOUNT' && (
                                <>
                                    <div className="text-sm text-slate-500">
                                        Monto:
                                        <strong className="text-slate-700">
                                            {' '}
                                            {formatDiscountValue(
                                                data?.discount_amount,
                                                data?.discount_type
                                            )}
                                        </strong>
                                    </div>

                                    {Number(data?.discount_limit) > 0 && (
                                        <div className="text-sm text-slate-500">
                                            Límite de descuento:
                                            <strong className="text-slate-700">
                                                {' '}
                                                ${Number(data.discount_limit)}
                                            </strong>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {a.operation_type !== 'DISCOUNT' && (
                            <>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(a)}
                                        className="text-indigo-600 font-medium hover:underline"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(a.id)
                                        }
                                        className="text-red-500 font-medium hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </>
                        )}
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
                        onChange={(e) =>
                            handleOperationChange(e.target.value)
                        }
                    >
                        {/* <option value="DISCOUNT">
                            Descuento
                        </option> */}

                        <option value="ADD_PRODUCT">
                            Agregar Producto Individual
                        </option>

                        <option value="ADD_GIFT">
                            Agregar Regalo Individual
                        </option>

                        <option value="ADD_GROUP_PRODUCTS">
                            Agregar Productos de Grupo
                        </option>

                        {/* <option value="ADD_GROUP_GIFT">
                            Agregar Regalos de Grupo
                        </option> */}
                    </select>
                </Field>

                {!isDiscount && (
                    <>
                        <Field label="Tipo de Objetivo">
                            <input
                                className="w-full p-3 border rounded-xl bg-slate-100 text-slate-500"
                                value={getTargetLabel(action.target_type)}
                                disabled
                            />
                        </Field>

                        {isGroup && (
                            <Field
                                label={
                                    action.target_type === 'gift_group'
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

                                    {(action.target_type === 'gift_group'
                                        ? groups.gifts
                                        : groups.products
                                    ).map(g => (
                                        <option
                                            key={g.id}
                                            value={g.id}
                                        >
                                            {g.group || g.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        {isIndividual && (
                            <div className="space-y-3">
                                <Field
                                    label={
                                        action.target_type === 'gift'
                                            ? 'Buscar Regalo por SKU'
                                            : 'Buscar Producto por SKU'
                                    }
                                >
                                    <div className="flex gap-3">
                                        <input
                                            className="w-full p-3 border rounded-xl"
                                            value={skuSearch}
                                            placeholder="Ingresa el SKU"
                                            onChange={(e) =>
                                                setSkuSearch(e.target.value)
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={handleSearchBySku}
                                            className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition"
                                        >
                                            Buscar
                                        </button>
                                    </div>
                                </Field>

                                {selectedItem && (
                                    <div className="p-4 bg-white border rounded-xl text-sm">
                                        <div className="font-semibold text-slate-800">
                                            Seleccionado:
                                        </div>

                                        <div className="text-slate-600">
                                            {getItemName(selectedItem)}
                                        </div>

                                        <div className="text-slate-500">
                                            SKU: {getItemSku(selectedItem)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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

                        {showProductOptions && (
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
                    type="button"
                    onClick={handleSaveAction}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-sm font-bold transition"
                >
                    {action.id
                        ? 'Guardar Cambios'
                        : '+ Agregar Acción'}
                </button>

                {action.id && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="w-full text-slate-500 text-sm hover:underline"
                    >
                        Cancelar edición
                    </button>
                )}
            </div>

            <button
                type="button"
                onClick={onFinish}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition"
            >
                Finalizar Promoción
            </button>
        </div>
    );
}