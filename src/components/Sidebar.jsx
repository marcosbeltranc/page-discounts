'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Tag, Package, LogOut, Gift } from 'lucide-react';

export default function Sidebar({ onLogout }) {
    const pathname = usePathname();

    // Definición de las opciones del menú centralizadas
    const menuItems = [
        // { name: 'Promociones Matrix', href: '/admin/promotions', icon: Tag },
        { name: 'Productos', href: '/admin/products', icon: Package },
        { name: 'Grupos de Productos', href: '/admin/product-groups', icon: Package },
        { name: 'Productos Promocionales', href: '/admin/products-promo', icon: Gift },
        // { name: 'Productos Promocionales', href: '/admin/products', icon: Package },
    ];

    return (
        <aside className="w-64 bg-white/40 backdrop-blur-xl border-r border-white/60 flex flex-col justify-between fixed h-full z-20 shadow-[4px_0_24px_0_rgba(0,0,0,0.03)]">
            <div>
                {/* Header del Sidebar con el Logo */}
                <div className="p-6 flex justify-center border-b border-white/40">
                    <div className="relative mix-blend-multiply">
                        <Image
                            src="/images/promo.png"
                            alt="Logo"
                            width={150}
                            height={150}
                            priority
                        />
                    </div>
                </div>

                {/* Enlaces del Menú */}
                <nav className="p-4 space-y-1.5 mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:translate-x-1'
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer del Sidebar con Botón de Salir */}
            <div className="p-4 border-t border-white/40">
                <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all active:scale-[0.98]"
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}