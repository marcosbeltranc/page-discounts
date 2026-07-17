'use client';
import { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { Trash2, Edit, ChevronUp, ChevronDown, Search, X } from 'lucide-react';

export default function PromotionTable({ promotions, onRefresh, onEdit }) {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

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
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Necesario para el buscador
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 8 } }
    });

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

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs font-medium text-slate-600">
                    <thead className="bg-slate-50 uppercase font-bold text-slate-500">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 cursor-pointer hover:bg-slate-100" onClick={header.column.getToggleSortingHandler()}>
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
            </div>

            {/* Controles de Paginación */}
            <div className="flex items-center justify-between p-4 bg-white border-t border-slate-100 rounded-2xl">
                <div className="text-xs text-slate-500">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </button>
                    <button
                        className="px-3 py-1 text-xs border rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </>
    );
}