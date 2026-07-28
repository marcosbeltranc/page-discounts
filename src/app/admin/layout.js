'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '@/components/Sidebar';
import Label from '@/components/Label';

export default function AdminLayout({ children }) {
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            window.location.href = '/login';
        } else {
            setAuthorized(true);
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove('token');
        window.location.href = '/login';
    };

    if (!authorized) return null;

    return (
        <div className="flex min-h-screen bg-radial from-slate-50 to-slate-200 text-slate-800 font-sans">

            {/* SIDEBAR GLOBAL EXTRAÍDO */}
            <Sidebar onLogout={handleLogout} />

            {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
            <div className="pl-64 w-full flex flex-col min-h-screen">

                {/* Navbar superior delgado */}
                <header className="h-16 border-b border-white/50 bg-white/30 backdrop-blur-md flex items-center justify-end px-8 sticky top-0 z-10 shadow-[0_2px_12px_0_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/60 px-3 py-1.5 rounded-full border border-white/80 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Sesión de Administrador</span>
                    </div>
                </header>

                {/* Contenido dinámico de las páginas */}
                <main className="flex-1 p-8">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            <Label />
        </div>
    );
}