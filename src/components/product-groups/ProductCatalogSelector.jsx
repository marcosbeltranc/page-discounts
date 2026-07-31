'use client';

import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    ChevronDown,
    ChevronRight,
    FileSpreadsheet,
    Loader2,
    PackageSearch,
    Search,
    Upload,
    X
} from 'lucide-react';

const normalizeSku = (value) => String(value ?? '').trim().toUpperCase();

const normalizeText = (value = '') => (
    String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
);

const getProductSku = (product) => (
    normalizeSku(product?.sku || product?.codigo_sap)
);

const SUPPORTED_EXTENSIONS = ['csv', 'xlsx', 'xls'];

export default function ProductCatalogSelector({
    catalogSearch,
    setCatalogSearch,
    loadingCatalog,
    products = [],
    automaticGroups = [],
    selectedSkus = [],
    onToggleSku,
    onToggleGroup,
    onReplaceSelection
}) {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [importingSelection, setImportingSelection] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    const selectedSet = useMemo(() => {
        return new Set(selectedSkus.map(normalizeSku).filter(Boolean));
    }, [selectedSkus]);

    const sections = useMemo(() => {
        const productBySku = new Map();

        products.forEach((product) => {
            const sku = getProductSku(product);
            if (sku) productBySku.set(sku, product);
        });

        const groupedSkus = new Set();

        const automaticSections = automaticGroups
            .map((group) => {
                const skus = [...new Set(
                    (group.values || [])
                        .map(normalizeSku)
                        .filter(Boolean)
                )];

                skus.forEach(sku => groupedSkus.add(sku));

                return {
                    id: `auto-${group.id}`,
                    name: group.group,
                    products: skus.map((sku) => (
                        productBySku.get(sku) || {
                            sku,
                            descripcion: 'Producto no disponible en el catálogo',
                            missingFromCatalog: true
                        }
                    )),
                    isUngrouped: false
                };
            })
            .filter(section => section.products.length > 0);

        const ungroupedProducts = products.filter((product) => {
            const sku = getProductSku(product);
            return sku && !groupedSkus.has(sku);
        });

        if (ungroupedProducts.length > 0) {
            automaticSections.push({
                id: 'ungrouped-products',
                name: 'Productos sin grupo automático',
                products: ungroupedProducts,
                isUngrouped: true
            });
        }

        return automaticSections;
    }, [automaticGroups, products]);

    const knownSkuSet = useMemo(() => {
        const skus = new Set();

        products.forEach((product) => {
            const sku = getProductSku(product);
            if (sku) skus.add(sku);
        });

        automaticGroups.forEach((group) => {
            (group.values || []).forEach((value) => {
                const sku = normalizeSku(value);
                if (sku) skus.add(sku);
            });
        });

        return skus;
    }, [products, automaticGroups]);

    const normalizedSearch = normalizeText(catalogSearch);

    const visibleSections = useMemo(() => {
        return sections
            .map((section) => {
                const groupMatches = normalizeText(section.name)
                    .includes(normalizedSearch);

                const visibleProducts = !normalizedSearch || groupMatches
                    ? section.products
                    : section.products.filter((product) => {
                        const searchableText = normalizeText([
                            getProductSku(product),
                            product.codigo_sap,
                            product.descripcion,
                            product.marca,
                            product.laboratorio
                        ].filter(Boolean).join(' '));

                        return searchableText.includes(normalizedSearch);
                    });

                return {
                    ...section,
                    visibleProducts
                };
            })
            .filter(section => section.visibleProducts.length > 0);
    }, [sections, normalizedSearch]);

    const toggleExpanded = (sectionId) => {
        setExpandedGroups((previous) => ({
            ...previous,
            [sectionId]: !previous[sectionId]
        }));
    };

    const clearSelection = () => {
        onToggleGroup([...selectedSet], false);
        setImportResult(null);
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleSelectionFile = async (event) => {
        const file = event.target.files?.[0];

        // Permite volver a seleccionar el mismo archivo después.
        event.target.value = '';

        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!SUPPORTED_EXTENSIONS.includes(extension)) {
            toast.error('El archivo debe ser CSV, XLSX o XLS.');
            return;
        }

        try {
            setImportingSelection(true);
            setImportResult(null);

            const XLSX = await import('xlsx');
            const fileBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(fileBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames?.[0];

            if (!firstSheetName) {
                toast.error('El archivo no contiene una hoja válida.');
                return;
            }

            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: '',
                raw: false,
                blankrows: false
            });

            const nonEmptyRows = rows
                .map(row => Array.isArray(row) ? row : [])
                .filter(row => row.some(cell => String(cell ?? '').trim() !== ''));

            if (nonEmptyRows.length === 0) {
                toast.error('El archivo está vacío.');
                return;
            }

            const hasAdditionalColumns = nonEmptyRows.some((row) => (
                row.slice(1).some(cell => String(cell ?? '').trim() !== '')
            ));

            if (hasAdditionalColumns) {
                toast.error('El archivo debe contener una sola columna: SKU.');
                return;
            }

            const header = normalizeSku(nonEmptyRows[0]?.[0]);

            if (header !== 'SKU') {
                toast.error('La celda A1 debe contener el encabezado SKU.');
                return;
            }

            const importedSkus = [...new Set(
                nonEmptyRows
                    .slice(1)
                    .map(row => normalizeSku(row[0]))
                    .filter(Boolean)
            )];

            if (importedSkus.length === 0) {
                toast.error('No se encontraron SKUs debajo del encabezado.');
                return;
            }

            const matchedSkus = importedSkus.filter(sku => knownSkuSet.has(sku));
            const missingSkus = importedSkus.filter(sku => !knownSkuSet.has(sku));

            if (matchedSkus.length === 0) {
                toast.error('Ningún SKU del archivo existe en el catálogo actual.');
                return;
            }

            // Sustituye completamente la selección previa.
            onReplaceSelection(matchedSkus);
            setCatalogSearch('');

            const matchedSet = new Set(matchedSkus);
            const groupsToExpand = {};

            sections.forEach((section) => {
                const containsImportedSku = section.products.some(
                    product => matchedSet.has(getProductSku(product))
                );

                if (containsImportedSku) {
                    groupsToExpand[section.id] = true;
                }
            });

            setExpandedGroups(groupsToExpand);
            setImportResult({
                fileName: file.name,
                selectedCount: matchedSkus.length,
                missingCount: missingSkus.length
            });

            toast.success(
                `${matchedSkus.length} SKU${matchedSkus.length === 1 ? '' : 's'} cargado${matchedSkus.length === 1 ? '' : 's'}.`
            );

            if (missingSkus.length > 0) {
                const preview = missingSkus.slice(0, 5).join(', ');
                const remaining = missingSkus.length - 5;

                toast.warning(
                    `${missingSkus.length} SKU${missingSkus.length === 1 ? '' : 's'} no encontrado${missingSkus.length === 1 ? '' : 's'}: ${preview}${remaining > 0 ? ` y ${remaining} más` : ''}.`
                );
            }
        } catch (error) {
            console.error('Error al importar selección de productos:', error);
            toast.error('No se pudo leer el archivo. Verifica que no esté dañado.');
        } finally {
            setImportingSelection(false);
        }
    };

    return (
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-800">
                        Seleccionar productos
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Usa los grupos automáticos para localizar y seleccionar productos.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-600">
                        {selectedSet.size} seleccionados
                    </span>

                    {selectedSet.size > 0 && (
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            <div className="relative">
                <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                    type="text"
                    value={catalogSearch}
                    onChange={(event) => setCatalogSearch(event.target.value)}
                    placeholder="Buscar producto, SKU, marca, laboratorio o grupo..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
                />

                {catalogSearch && (
                    <button
                        type="button"
                        onClick={() => setCatalogSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-indigo-600 shrink-0">
                        <FileSpreadsheet size={16} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-700">
                            Cargar selección desde archivo
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            CSV, XLSX o XLS. A1 debe ser SKU y no debe haber otras columnas.
                        </p>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={handleSelectionFile}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={importingSelection || loadingCatalog}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {importingSelection ? (
                        <Loader2 size={13} className="animate-spin" />
                    ) : (
                        <Upload size={13} />
                    )}
                    {importingSelection ? 'Procesando...' : 'Cargar selección'}
                </button>
            </div>

            {importResult && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <span className="font-bold text-emerald-700 truncate max-w-[240px]">
                        {importResult.fileName}
                    </span>
                    <span className="text-emerald-600">
                        {importResult.selectedCount} seleccionados
                    </span>
                    {importResult.missingCount > 0 && (
                        <span className="text-amber-600 font-semibold">
                            {importResult.missingCount} no encontrados
                        </span>
                    )}
                </div>
            )}

            <div className="flex-1 min-h-[360px] max-h-[520px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {loadingCatalog ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2
                            size={20}
                            className="animate-spin text-indigo-500"
                        />
                        <span className="text-xs font-semibold">
                            Cargando catálogo de productos...
                        </span>
                    </div>
                ) : visibleSections.length === 0 ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400">
                        <PackageSearch size={26} className="mb-2" />
                        <p className="text-xs font-semibold">
                            No se encontraron productos o grupos coincidentes.
                        </p>
                    </div>
                ) : (
                    visibleSections.map((section) => {
                        const visibleSkus = section.visibleProducts
                            .map(getProductSku)
                            .filter(Boolean);

                        const allVisibleSelected = (
                            visibleSkus.length > 0 &&
                            visibleSkus.every(sku => selectedSet.has(sku))
                        );

                        const someVisibleSelected = visibleSkus.some(
                            sku => selectedSet.has(sku)
                        );

                        const selectedInGroup = section.products.reduce(
                            (total, product) => (
                                selectedSet.has(getProductSku(product))
                                    ? total + 1
                                    : total
                            ),
                            0
                        );

                        const isExpanded = (
                            Boolean(normalizedSearch) ||
                            Boolean(expandedGroups[section.id])
                        );

                        return (
                            <div
                                key={section.id}
                                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                            >
                                <div className="flex items-center gap-3 px-3.5 py-3 bg-slate-50/80">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        ref={(element) => {
                                            if (element) {
                                                element.indeterminate = (
                                                    someVisibleSelected &&
                                                    !allVisibleSelected
                                                );
                                            }
                                        }}
                                        onChange={() => {
                                            onToggleGroup(
                                                visibleSkus,
                                                !allVisibleSelected
                                            );
                                        }}
                                        title={
                                            normalizedSearch
                                                ? 'Seleccionar coincidencias visibles'
                                                : 'Seleccionar grupo completo'
                                        }
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => toggleExpanded(section.id)}
                                        className="flex-1 min-w-0 flex items-center justify-between gap-3 text-left"
                                    >
                                        <div className="min-w-0 flex items-center gap-2">
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
                                                <div className="text-xs font-bold text-slate-800 truncate">
                                                    {section.name}
                                                </div>

                                                {normalizedSearch &&
                                                    section.visibleProducts.length !==
                                                        section.products.length && (
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        {section.visibleProducts.length}{' '}
                                                        coincidencias de{' '}
                                                        {section.products.length}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 ${
                                            selectedInGroup > 0
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {selectedInGroup} / {section.products.length}
                                        </span>
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="divide-y divide-slate-100 border-t border-slate-200">
                                        {section.visibleProducts.map((product) => {
                                            const productSku = getProductSku(product);
                                            const isSelected = selectedSet.has(productSku);

                                            return (
                                                <label
                                                    key={`${section.id}-${productSku}`}
                                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                                        isSelected
                                                            ? 'bg-indigo-50/60'
                                                            : 'bg-white hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => onToggleSku(productSku)}
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-xs font-semibold truncate ${
                                                            product.missingFromCatalog
                                                                ? 'text-slate-400 italic'
                                                                : 'text-slate-700'
                                                        }`}>
                                                            {product.descripcion || 'Producto sin descripción'}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px]">
                                                            <span className="font-mono font-bold text-indigo-500">
                                                                {productSku}
                                                            </span>

                                                            {product.marca && (
                                                                <span className="text-slate-500 font-semibold">
                                                                    {product.marca}
                                                                </span>
                                                            )}

                                                            {product.laboratorio && (
                                                                <span className="text-slate-400">
                                                                    {product.laboratorio}
                                                                </span>
                                                            )}
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
