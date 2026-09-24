'use client';
import { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import UserHeader from '@/components/users/UserHeader';
import UserFilters from '@/components/users/UserFilters';
import UserTable from '@/components/users/UserTable';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [editingUser, setEditingUser] = useState(null); // <-- Estado para editar

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            const res = response.data || response;
            const userList = Array.isArray(res) ? res : (res?.result || []);
            setUsers(userList);

            const savedEmail = Cookies.get('user_email');
            if (savedEmail) {
                const currentUser = userList.find(u => u.email === savedEmail);
                if (currentUser) setCurrentUserId(currentUser.id);
            }
        } catch (error) {
            toast.error('Error al cargar la lista de usuarios.');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return users.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    }, [searchTerm, users]);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <UserHeader
                onRefresh={fetchUsers}
                loading={loading}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
            />
            <UserFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <br />
            <UserTable
                users={filteredUsers}
                loading={loading}
                onRefresh={fetchUsers}
                currentUserId={currentUserId}
                onEdit={setEditingUser} // <-- Pasamos la función para disparar la edición
            />
        </div>
    );
}