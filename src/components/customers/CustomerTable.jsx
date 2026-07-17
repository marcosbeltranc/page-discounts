'use client';
import { useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, getPaginationRowModel } from '@tanstack/react-table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerTable({ customers, loading }) {
    const [sorting, setSorting] = useState([]);

    // Definición de columnas
    const columns = [
        { header: 'Código', accessorKey: 'codigo_cliente' },
        { header: 'Nombre', accessorKey: 'nombre_cliente' },
        { header: 'Grupo', accessorKey: 'grupo_cliente' },
        { header: 'RFC', accessorKey: 'rfc' },
        { header: 'Zona', accessorKey: 'zona_cliente' }
    ];

    const table = useReactTable({
        data: customers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    });

    if (loading) return <div className="text-center py-10">Cargando...</div>;

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 cursor-pointer hover:bg-slate-100" onClick={header.column.getToggleSortingHandler()}>
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{ asc: <ChevronUp size={12} />, desc: <ChevronDown size={12} /> }[header.column.getIsSorted() ?? null]}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
            </div>
            <br />
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