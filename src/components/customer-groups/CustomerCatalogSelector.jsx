'use client';

import { useMemo, useState } from 'react';
import {
    Search,
    X,
    Loader2,
    ChevronDown,
    ChevronRight,
    Users
} from 'lucide-react';

function normalizeText(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function getCustomerCode(customer) {
    return String(customer?.codigo_cliente ?? '');
}

export default function CustomerCatalogSelector({
    catalogSearch,
    setCatalogSearch,
    loadingCatalog,
    customers = [],
    automaticGroups = [],
    selectedIds = [],
    onToggleCustomer,
    onToggleGroup
}) {
    const [expandedGroups, setExpandedGroups] = useState({});

    const selectedSet = useMemo(() => {
        return new Set(selectedIds.map(String));
    }, [selectedIds]);

    /*
     * Construye las secciones utilizando exclusivamente
     * los grupos automáticos como organización visual.
     */
    const sections = useMemo(() => {
        const customerByCode = new Map(
            customers.map(customer => [
                getCustomerCode(customer),
                customer
            ])
        );

        const groupedCodes = new Set();

        const automaticSections = automaticGroups
            .map(group => {
                const codes = [
                    ...new Set(
                        (group.values || [])
                            .map(String)
                            .filter(Boolean)
                    )
                ];

                codes.forEach(code => groupedCodes.add(code));

                const groupCustomers = codes.map(code => {
                    return customerByCode.get(code) || {
                        codigo_cliente: code,
                        nombre_cliente: 'Cliente no disponible en catálogo',
                        missingFromCatalog: true
                    };
                });

                return {
                    id: `auto-${group.id}`,
                    name: group.group,
                    customers: groupCustomers,
                    isUngrouped: false
                };
            })
            .filter(section => section.customers.length > 0);

        /*
         * Mantiene accesibles los clientes que no pertenecen
         * a ningún grupo automático.
         */
        const ungroupedCustomers = customers.filter(customer => {
            const code = getCustomerCode(customer);
            return code && !groupedCodes.has(code);
        });

        if (ungroupedCustomers.length > 0) {
            automaticSections.push({
                id: 'ungrouped-customers',
                name: 'Clientes sin grupo automático',
                customers: ungroupedCustomers,
                isUngrouped: true
            });
        }

        return automaticSections;
    }, [automaticGroups, customers]);

    const normalizedSearch = normalizeText(catalogSearch);

    const visibleSections = useMemo(() => {
        return sections
            .map(section => {
                const groupMatches = normalizeText(section.name)
                    .includes(normalizedSearch);

                const visibleCustomers =
                    !normalizedSearch || groupMatches
                        ? section.customers
                        : section.customers.filter(customer => {
                            const searchableText = normalizeText([
                                customer.nombre_cliente,
                                customer.codigo_cliente,
                                customer.rfc,
                                customer.RFC
                            ].filter(Boolean).join(' '));

                            return searchableText.includes(normalizedSearch);
                        });

                return {
                    ...section,
                    visibleCustomers
                };
            })
            .filter(section => section.visibleCustomers.length > 0);
    }, [sections, normalizedSearch]);

    const toggleExpanded = (sectionId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const clearSelection = () => {
        onToggleGroup([...selectedSet], false);
    };

    return (
        <div className="
            lg:col-span-7
            bg-white/70
            backdrop-blur-sm
            border border-white/80
            rounded-2xl
            p-6
            shadow-md
            flex flex-col
            gap-4
        ">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-800">
                        Seleccionar clientes
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                        Utiliza los grupos automáticos para localizar y seleccionar clientes.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="
                        px-2.5 py-1
                        bg-indigo-50
                        border border-indigo-100
                        rounded-lg
                        text-[10px]
                        font-bold
                        text-indigo-600
                    ">
                        {selectedSet.size} seleccionados
                    </span>

                    {selectedSet.size > 0 && (
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="
                                text-[10px]
                                font-bold
                                text-slate-400
                                hover:text-rose-600
                                transition-colors
                            "
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            <div className="relative">
                <Search
                    size={15}
                    className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        pointer-events-none
                    "
                />

                <input
                    type="text"
                    value={catalogSearch}
                    onChange={(event) => setCatalogSearch(event.target.value)}
                    placeholder="Buscar cliente, código, RFC o grupo..."
                    className="
                        w-full
                        bg-white
                        border border-slate-200
                        rounded-xl
                        pl-9 pr-9 py-2.5
                        text-xs
                        font-semibold
                        text-slate-800
                        placeholder-slate-400
                        focus:outline-none
                        focus:border-indigo-500
                        shadow-inner
                    "
                />

                {catalogSearch && (
                    <button
                        type="button"
                        onClick={() => setCatalogSearch('')}
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            hover:text-slate-700
                        "
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="
                flex-1
                min-h-[360px]
                max-h-[520px]
                overflow-y-auto
                custom-scrollbar
                space-y-2
                pr-1
            ">
                {loadingCatalog ? (
                    <div className="
                        min-h-[300px]
                        flex flex-col
                        items-center
                        justify-center
                        gap-2
                        text-slate-400
                    ">
                        <Loader2
                            size={20}
                            className="animate-spin text-indigo-500"
                        />

                        <span className="text-xs font-semibold">
                            Cargando catálogo de clientes...
                        </span>
                    </div>
                ) : visibleSections.length === 0 ? (
                    <div className="
                        min-h-[300px]
                        flex flex-col
                        items-center
                        justify-center
                        text-center
                        text-slate-400
                    ">
                        <Users size={24} className="mb-2" />

                        <p className="text-xs font-semibold">
                            No se encontraron clientes o grupos coincidentes.
                        </p>
                    </div>
                ) : (
                    visibleSections.map(section => {
                        const visibleIds = section.visibleCustomers
                            .map(getCustomerCode)
                            .filter(Boolean);

                        const allVisibleSelected =
                            visibleIds.length > 0 &&
                            visibleIds.every(id => selectedSet.has(id));

                        const someVisibleSelected =
                            visibleIds.some(id => selectedSet.has(id));

                        const selectedInGroup = section.customers.reduce(
                            (total, customer) => {
                                return selectedSet.has(getCustomerCode(customer))
                                    ? total + 1
                                    : total;
                            },
                            0
                        );

                        /*
                         * Durante una búsqueda se expanden automáticamente
                         * todos los grupos con coincidencias.
                         */
                        const isExpanded =
                            Boolean(normalizedSearch) ||
                            Boolean(expandedGroups[section.id]);

                        return (
                            <div
                                key={section.id}
                                className="
                                    bg-white
                                    border border-slate-200
                                    rounded-xl
                                    overflow-hidden
                                    shadow-sm
                                "
                            >
                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                    px-3.5
                                    py-3
                                    bg-slate-50/80
                                ">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        ref={(element) => {
                                            if (element) {
                                                element.indeterminate =
                                                    someVisibleSelected &&
                                                    !allVisibleSelected;
                                            }
                                        }}
                                        onChange={() => {
                                            onToggleGroup(
                                                visibleIds,
                                                !allVisibleSelected
                                            );
                                        }}
                                        title={
                                            normalizedSearch
                                                ? 'Seleccionar coincidencias visibles'
                                                : 'Seleccionar grupo completo'
                                        }
                                        className="
                                            w-4 h-4
                                            rounded
                                            border-slate-300
                                            text-indigo-600
                                            focus:ring-indigo-500
                                            cursor-pointer
                                            shrink-0
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() => toggleExpanded(section.id)}
                                        className="
                                            flex-1
                                            min-w-0
                                            flex
                                            items-center
                                            justify-between
                                            gap-3
                                            text-left
                                        "
                                    >
                                        <div className="
                                            min-w-0
                                            flex
                                            items-center
                                            gap-2
                                        ">
                                            {isExpanded ? (
                                                <ChevronDown
                                                    size={15}
                                                    className="text-slate-400 shrink-0"
                                                />
                                            ) : (
                                                <ChevronRight
                                                    size={15}
                                                    className="text-slate-400 shrink-0"
                                                />
                                            )}

                                            <div className="min-w-0">
                                                <div className="
                                                    text-xs
                                                    font-bold
                                                    text-slate-800
                                                    truncate
                                                ">
                                                    {section.name}
                                                </div>

                                                {normalizedSearch &&
                                                    section.visibleCustomers.length !==
                                                    section.customers.length && (
                                                        <div className="
                                                        text-[10px]
                                                        text-slate-400
                                                        mt-0.5
                                                    ">
                                                            {
                                                                section.visibleCustomers
                                                                    .length
                                                            } coincidencias de{' '}
                                                            {section.customers.length}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <span className={`
                                            px-2 py-1
                                            rounded-md
                                            text-[10px]
                                            font-bold
                                            shrink-0
                                            ${selectedInGroup > 0
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'bg-slate-100 text-slate-400'
                                            }
                                        `}>
                                            {selectedInGroup} /{' '}
                                            {section.customers.length}
                                        </span>
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="
                                        divide-y
                                        divide-slate-100
                                        border-t
                                        border-slate-200
                                    ">
                                        {section.visibleCustomers.map(customer => {
                                            const customerCode =
                                                getCustomerCode(customer);

                                            const isSelected =
                                                selectedSet.has(customerCode);

                                            return (
                                                <label
                                                    key={`${section.id}-${customerCode}`}
                                                    className={`
                                                        flex
                                                        items-center
                                                        gap-3
                                                        px-4
                                                        py-2.5
                                                        cursor-pointer
                                                        transition-colors
                                                        ${isSelected
                                                            ? 'bg-indigo-50/60'
                                                            : 'bg-white hover:bg-slate-50'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            onToggleCustomer(
                                                                customerCode
                                                            )
                                                        }
                                                        className="
                                                            w-4 h-4
                                                            rounded
                                                            border-slate-300
                                                            text-indigo-600
                                                            focus:ring-indigo-500
                                                            cursor-pointer
                                                            shrink-0
                                                        "
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <div className={`
                                                            text-xs
                                                            font-semibold
                                                            truncate
                                                            ${customer.missingFromCatalog
                                                                ? 'text-slate-400 italic'
                                                                : 'text-slate-700'
                                                            }
                                                        `}>
                                                            {
                                                                customer.nombre_cliente
                                                            }
                                                        </div>

                                                        <div className="
                                                            text-[10px]
                                                            font-mono
                                                            font-bold
                                                            text-indigo-500
                                                            mt-0.5
                                                        ">
                                                            {customerCode}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}