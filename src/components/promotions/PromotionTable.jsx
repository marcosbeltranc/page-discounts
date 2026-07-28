'use client';
import { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { Trash2, Edit, ChevronUp, ChevronDown, Search, X } from 'lucide-react';

// Deriva el status visual de una promoción a partir de 'active' y sus fechas.
// - Inactiva: active = false (borrador, o pendiente de completar el wizard)
// - Programada: active = true pero start_at todavía no llega
// - Activa: active = true y estamos dentro del rango de fechas
// - Expirada: active = true pero end_at ya pasó
const getPromotionStatus = (promotion) => {
    if (!promotion.active) {
        return { label: 'Inactiva', className: 'bg-slate-100 text-slate-600' };
    }

    const now = new Date();
    const start = promotion.start_at ? new Date(promotion.start_at) : null;
    const end = promotion.end_at ? new Date(promotion.end_at) : null;

    if (end && end < now) {
        return { label: 'Expirada', className: 'bg-rose-100 text-rose-700' };
    }

    if (start && start > now) {
        return { label: 'Programada', className: 'bg-amber-100 text-amber-700' };
    }

    return { label: 'Activa', className: 'bg-emerald-100 text-emerald-700' };
};

const StatusBadge = ({ promotion }) => {
    const status = getPromotionStatus(promotion);

    return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${status.className}`}>
            {status.label}
        </span>
    );
};

export default function PromotionTable({ promotions, onRefresh, onEdit }) {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });

    // Filtramos los datos antes de pasarlos a la tabla para el filtro de "Tipo"
    const filteredData = useMemo(() => {
        if (typeFilter === 'all') return promotions;
        return promotions.filter(p => p.type === typeFilter);
    }, [promotions, typeFilter]);

    const columns = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Nombre', accessorKey: 'name' },
        { header: 'Código', accessorKey: 'code' },
        { header: 'Descripción', accessorKey: 'description' },
        // { header: 'Tipo', accessorKey: 'type' },
        {
            header: 'Status',
            id: 'status',
            accessorFn: row => getPromotionStatus(row).label,
            cell: ({ row }) => <StatusBadge promotion={row.original} />
        },
        { header: 'Inicio', accessorKey: 'start_at', cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '-' },
        {
            header: 'Fin',
            accessorKey: 'end_at',
            cell: ({ getValue }) => {
                const date = getValue();
                const isExpired = date && new Date(date) < new Date();
                return <span className={isExpired ? "text-rose-600 font-bold" : "text-slate-600"}>{date ? new Date(date).toLocaleDateString() : '-'}</span>;
            }
        },
        {
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <button onClick={() => onEdit(row.original)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><Edit size={14} /></button>
                    <button onClick={() => { if (confirm('¿Eliminar?')) { api.delete(`/promotions/delete/${row.original.id}`).then(onRefresh); } }} className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"><Trash2 size={14} /></button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, globalFilter, pagination },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Necesario para el buscador
        getPaginationRowModel: getPaginationRowModel()
    });

    // Rango de números de página a mostrar alrededor de la página actual
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
            {/* Toolbar: Buscador y Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white/60 p-4 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Buscar promoción..."
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            {/* Tabla (escritorio / pantallas medianas en adelante) */}
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
                        No se encontraron promociones.
                    </div>
                )}
            </div>

            {/* Tarjetas (móvil) */}
            <div className="md:hidden space-y-3">
                {table.getRowModel().rows.map(row => {
                    const p = row.original;
                    return (
                        <div key={row.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                                    <div className="text-[11px] text-slate-400">ID {p.id} {p.code ? `· ${p.code}` : ''}</div>
                                </div>
                                <StatusBadge promotion={p} />
                            </div>

                            {p.description && (
                                <div className="text-xs text-slate-500 line-clamp-2">{p.description}</div>
                            )}

                            <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                <span>Inicio: {p.start_at ? new Date(p.start_at).toLocaleDateString() : '-'}</span>
                                <span className={p.end_at && new Date(p.end_at) < new Date() ? 'text-rose-600 font-bold' : ''}>
                                    Fin: {p.end_at ? new Date(p.end_at).toLocaleDateString() : '-'}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => onEdit(p)}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600"
                                >
                                    <Edit size={13} /> Editar
                                </button>
                                <button
                                    onClick={() => { if (confirm('¿Eliminar?')) { api.delete(`/promotions/delete/${p.id}`).then(onRefresh); } }}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600"
                                >
                                    <Trash2 size={13} /> Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}

                {table.getRowModel().rows.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        No se encontraron promociones.
                    </div>
                )}
            </div>

            {/* Controles de Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border-t border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                        Página {currentPageIndex + 1} de {pageCount || 1}
                    </span>

                    <label className="flex items-center gap-1">
                        <span className="hidden sm:inline">Filas por página</span>
                        <select
                            value={pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="border rounded-lg px-2 py-1 text-xs"
                        >
                            {[8, 15, 25, 50].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        «
                    </button>
                    <button
                        className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </button>

                    {pageNumbers.map(i => (
                        <button
                            key={i}
                            onClick={() => table.setPageIndex(i)}
                            className={`px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 ${i === currentPageIndex ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </button>
                    <button
                        className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        »
                    </button>
                </div>
            </div>
        </>
    );
}