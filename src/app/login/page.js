'use client';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { Lock, Mail, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const response = await api.post('/login', { email, password });

        if (response.error) {
            setErrorMsg(response.result);
            setLoading(false);
        } else {
            // Guardar el token en la cookie (expira en 1 día)
            Cookies.set('token', response.result.token, { expires: 1 });
            // Redirigir al panel de promociones
            window.location.href = '/admin/promotions';
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">

            {/* 1. Imagen de Fondo optimizada con Next.js */}
            <div className="absolute inset-0 -z-20">
                <Image
                    src="https://res.cloudinary.com/dc4tztadg/image/upload/q_auto/f_auto/v1780596624/2147932379_tanc0h.jpg"
                    alt="Fondo de compras en descuento"
                    fill
                    priority
                    className="object-cover object-center"
                />
            </div>

            {/* 2. Capa de superposición (Overlay) */}
            {/* Nota: Esta capa blanca semi-transparente unifica el fondo y garantiza que el formulario resalte sin importar el color de la foto */}
            <div className="absolute inset-0 -z-10 bg-white/40" />

            {/* 3. Contenedor del Formulario (Glassmorphism) */}
            <div
                className="relative w-full max-w-md p-8 overflow-hidden flex flex-col min-h-[300px] rounded-2xl
                           bg-white/20 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_0_rgba(0,0,0,0.12)]
                           translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)]"
            >
                {/* Contenedor del Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="relative mix-blend-multiply">
                        <Image src="/images/promo_logo.png" alt="Logo" width={180} height={180} priority />
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-5 rounded-lg bg-red-50/90 backdrop-blur-sm p-3.5 text-sm text-red-600 border border-red-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input: Email */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Correo Electrónico
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 group-focus-within:text-indigo-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl bg-white/70 border border-white/80 p-3 pl-11 text-slate-800 placeholder-slate-400 
                                           focus:outline-none focus:border-indigo-500 focus:bg-white shadow-sm text-sm transition-all"
                                placeholder="usuario@mepiel.com.mx"
                            />
                        </div>
                    </div>

                    {/* Input: Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Contraseña
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 group-focus-within:text-indigo-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl bg-white/70 border border-white/80 p-3 pl-11 text-slate-800 placeholder-slate-400 
                                           focus:outline-none focus:border-indigo-500 focus:bg-white shadow-sm text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Botón de Enviar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-indigo-600 p-3.5 text-sm font-semibold text-white 
                                   hover:bg-indigo-500 active:scale-[0.98] focus:outline-none disabled:opacity-50 shadow-md shadow-indigo-200 transition-all mt-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={18} />
                                Autenticando...
                            </>
                        ) : (
                            'Ingresar al Sistema'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}