'use client';
import { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { Trash2, Edit, ChevronUp, ChevronDown, Search, Tag, CheckCircle2, XCircle, Copy } from 'lucide-react';
// Importamos toast de sonner
import { toast } from 'sonner';

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

const LabelBadge = ({ label }) => {
    if (!label) return null;
    const bgColor = isValidHexColor(label.background_color) ? label.background_color : '#f0f0f0';
    const txtColor = isValidHexColor(label.text_color) ? label.text_color : getContrastColor(bgColor);

    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border border-black/10 truncate max-w-48"
            style={{ backgroundColor: bgColor, color: txtColor }}
            title={label.name}
        >
            <Tag size={12} className="mr-1 opacity-70" />
            {label.name || 'Sin nombre'}
        </span>
    );
};

export default function LabelTable({ labels, onRefresh, onEdit }) {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

    // Nueva función para manejar la eliminación estética con sonner
    const handleDeleteClick = (label) => {
        toast(`¿Eliminar la etiqueta "${label.name}"?`, {
            action: {
                label: 'Eliminar',
                onClick: async () => {
                    try {
                        const response = await api.delete(`/labels/delete/${label.id}`);
                        const resData = response.data || response;

                        // Adaptamos la validación a tu backend (asegúrate de que encaje con la respuesta de tu API)
                        if (resData && (resData.error === false || resData.error === 0)) {
                            toast.success('Etiqueta eliminada exitosamente.');
                            onRefresh();
                        } else {
                            toast.error(resData?.result || 'No se pudo eliminar la etiqueta.');
                        }
                    } catch (err) {
                        toast.error('Error al intentar eliminar el registro.');
                    }
                }
            },
            cancel: { label: 'Cancelar' }
        });
    };

    const columns = [
        { header: 'ID', accessorKey: 'id' },
        {
            header: 'Vista Previa',
            id: 'preview',
            cell: ({ row }) => <LabelBadge label={row.original} />
        },
        { header: 'Slug', accessorKey: 'slug', cell: info => <span className="text-slate-400 font-mono text-[10px]">{info.getValue() || '-'}</span> },
        {
            header: 'Asignación',
            id: 'assignment',
            cell: ({ row }) => {
                const l = row.original;
                if (l.product_id) return <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{l.product.sku}</span>;
                if (l.product_group_id) return <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{l.product_group.group}</span>;
                return <span className="text-[11px] text-slate-400 italic">Global</span>;
            }
        },
        {
            header: 'url',
            accessorKey: 'url',
            cell: ({ row }) => {
                const url = row.original.url;
                if (!url) return <span className="text-slate-400 italic text-[10px]">-</span>;

                // Función para copiar el URL completo
                const handleCopy = () => {
                    navigator.clipboard.writeText(url);
                    toast.success('URL copiada al portapapeles');
                };

                return (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600 text-[11px] truncate max-w-[250px]" title={url}>
                            {url}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer shrink-0"
                            title="Copiar URL"
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                );
            }
        },
        {
            header: 'Estado',
            accessorKey: 'is_active',
            cell: ({ row }) => (
                row.original.is_active
                    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600"><CheckCircle2 size={14} /> Activo</span>
                    : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400"><XCircle size={14} /> Inactivo</span>
            )
        },
        {
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <button onClick={() => onEdit(row.original)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"><Edit size={14} /></button>
                    {/* Reemplazado confirm() nativo por handleDeleteClick */}
                    <button onClick={() => handleDeleteClick(row.original)} className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition cursor-pointer"><Trash2 size={14} /></button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: labels,
        columns,
        state: { sorting, globalFilter, pagination },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    const pageCount = table.getPageCount();
    const currentPageIndex = table.getState().pagination.pageIndex;
    const pageNumbers = useMemo(() => {
        const windowSize = 5;
        let start = Math.max(0, currentPageIndex - Math.floor(windowSize / 2));
        let end = Math.min(pageCount, start + windowSize);
        start = Math.max(0, end - windowSize);
        return Array.from({ length: end - start }, (_, i) => start + i);
    }, [currentPageIndex, pageCount]);

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white/60 p-4 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Buscar etiqueta (nombre, slug)..."
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs font-medium text-slate-600">
                    <thead className="bg-slate-50 uppercase font-bold text-slate-500">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={header.column.getToggleSortingHandler()}>
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() && (header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {table.getRowModel().rows.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                        No se encontraron etiquetas.
                    </div>
                )}
            </div>

            {/* Móvil */}
            <div className="md:hidden space-y-3">
                {table.getRowModel().rows.map(row => {
                    const l = row.original;
                    return (
                        <div key={row.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{l.name}</div>
                                    <div className="text-[11px] text-slate-400">ID {l.id} {l.slug ? `· ${l.slug}` : ''}</div>
                                </div>
                                <LabelBadge label={l} />
                            </div>

                            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                                <span>Ranking: {l.ranking}</span>
                                <span>
                                    {l.is_active ? <span className="text-emerald-600 font-bold">Activo</span> : 'Inactivo'}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <button onClick={() => onEdit(l)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer">
                                    <Edit size={13} /> Editar
                                </button>
                                {/* Reemplazado confirm() nativo por handleDeleteClick */}
                                <button onClick={() => handleDeleteClick(l)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 transition cursor-pointer">
                                    <Trash2 size={13} /> Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border-t border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Página {currentPageIndex + 1} de {pageCount || 1}</span>
                    <label className="flex items-center gap-1">
                        <span className="hidden sm:inline">Filas por página</span>
                        <select value={pagination.pageSize} onChange={e => table.setPageSize(Number(e.target.value))} className="border rounded-lg px-2 py-1 text-xs">
                            {[8, 15, 25, 50].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="flex items-center gap-1">
                    <button className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>«</button>
                    <button className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</button>
                    {pageNumbers.map(i => (
                        <button key={i} onClick={() => table.setPageIndex(i)} className={`px-3 py-1 text-xs border rounded-lg ${i === currentPageIndex ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600' : ''}`}>{i + 1}</button>
                    ))}
                    <button className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</button>
                    <button className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>»</button>
                </div>
            </div>
        </>
    );
}