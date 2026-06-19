'use client';
import { useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, getPaginationRowModel } from '@tanstack/react-table';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function CustomerTable({ customers, loading }) {
    const [sorting, setSorting] = useState([]);

    // Definición de columnas
    const columns = [
        { header: 'Código', accessorKey: 'codigo_cliente' },
        { header: 'Nombre', accessorKey: 'nombre_cliente' },
        { header: 'Grupo', accessorKey: 'grupo_cliente' },
        { header: 'Zona', accessorKey: 'zona_cliente' },
        { header: 'Crédito', accessorKey: 'credito' }
    ];

    const table = useReactTable({
        data: customers,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 20 } }
    });

    if (loading) return <div className="text-center py-10">Cargando...</div>;

    return (
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

            {/* Controles de paginación de TanStack Table */}
            <div className="p-4 flex justify-between border-t">
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</button>
                <span>Página {table.getState().pagination.pageIndex + 1}</span>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</button>
            </div>
        </div>
    );
}