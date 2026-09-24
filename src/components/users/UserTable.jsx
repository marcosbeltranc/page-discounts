'use client';
import { useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, getPaginationRowModel } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Trash2, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function UserTable({ users, loading, onRefresh, currentUserId, onEdit }) {
    const [sorting, setSorting] = useState([]);

    const handleDelete = async (id) => {
        toast('¿Estás seguro?', {
            description: 'Esta acción eliminará el acceso del usuario.',
            action: {
                label: 'Eliminar',
                onClick: async () => {
                    try {
                        await api.delete(`/users/delete/${id}`);
                        toast.success('Usuario eliminado.');
                        onRefresh();
                    } catch (error) {
                        toast.error('Error al eliminar el usuario.');
                    }
                }
            },
            cancel: { label: 'Cancelar' }
        });
    };

    const columns = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Nombre', accessorKey: 'name' },
        { header: 'Correo', accessorKey: 'email' },
        {
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => {
                const isCurrentUser = row.original.id === currentUserId;

                return (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onEdit(row.original)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Editar usuario"
                        >
                            <Pencil size={14} />
                        </button>

                        {isCurrentUser ? (
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-md font-semibold">
                                Sesión actual
                            </span>
                        ) : (
                            <button
                                onClick={() => handleDelete(row.original.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="Eliminar usuario"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const table = useReactTable({
        data: users,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    });

    if (loading) return <div className="text-center py-10 text-xs text-slate-400">Cargando usuarios...</div>;

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 cursor-pointer hover:bg-slate-100 font-bold" onClick={header.column.getToggleSortingHandler()}>
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
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-4 text-slate-700">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <br />
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
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