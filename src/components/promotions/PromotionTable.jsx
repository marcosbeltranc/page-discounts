'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, getPaginationRowModel } from '@tanstack/react-table';
import { Trash2, Edit, ChevronUp, ChevronDown } from 'lucide-react';

export default function PromotionTable({ promotions, onRefresh, onEdit }) {
    const [sorting, setSorting] = useState([]);

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;
        try {
            await api.delete(`/promotions/delete/${id}`);
            onRefresh();
        } catch (error) {
            alert('Error al eliminar la promoción');
        }
    };

    const columns = [
        { header: 'Nombre', accessorKey: 'name' },
        { header: 'Código', accessorKey: 'code' },
        { header: 'Tipo', accessorKey: 'type' },
        {
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button onClick={() => onEdit(row.original)} className="p-2 hover:bg-slate-100 rounded">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.original.id)} className="p-2 hover:bg-red-50 rounded">
                        <Trash2 size={16} className="text-red-600" />
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: promotions,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="p-4 cursor-pointer" onClick={header.column.getToggleSortingHandler()}>
                                    <div className="flex items-center gap-1">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{ asc: <ChevronUp size={12} />, desc: <ChevronDown size={12} /> }[header.column.getIsSorted() ?? null]}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50">
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="p-4">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Paginación simple */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
                <div className="flex gap-2">
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 bg-slate-100 rounded">Anterior</button>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 bg-slate-100 rounded">Siguiente</button>
                </div>
            </div>
        </div>
    );
}