'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Database, Star } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Fallo en el registro');
            }

            // Auto login after successful registration
            const signInRes = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (signInRes?.error) {
                router.push('/login');
            } else {
                router.push('/projects');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-black selection:bg-indigo-500/30 font-sans">
            
            {/* Absolute Background Layer (Bleeds to edges) */}
            <div className="absolute inset-x-0 inset-y-0 grid grid-cols-1 lg:grid-cols-2">
                {/* Left side base background (Black) */}
                <div className="bg-black w-full h-full"></div>
                
                {/* Right side background video (Hidden on mobile) */}
                <div className="hidden lg:block relative w-full h-full bg-zinc-900 overflow-hidden border-l border-white/5">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen"
                    >
                        <source src="/videos/glass-animation-5.mp4" type="video/mp4" />
                    </video>
                    {/* Overlay Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
            </div>

            {/* Constrained Content Layer (max-w 1280px) */}
            <div className="relative z-10 w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 h-screen">
                
                {/* Left Column: Form Container */}
                <div className="flex flex-col py-12 px-6 sm:px-12 lg:px-24 xl:px-32 justify-center h-full overflow-y-auto w-full">
                    {/* Logo top-left corner */}
                    <div className="absolute top-12 left-6 sm:left-12 lg:left-24 xl:left-32">
                        <Link href="/" className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-indigo-400" />
                            <span className="text-lg font-bold tracking-tight text-white">AeroDB</span>
                        </Link>
                    </div>

                    <div className="w-full max-w-[400px] mx-auto mt-16 sm:mt-0">
                        <div className="mb-8">
                            <h1 className="text-3xl font-medium text-white tracking-tight">Regístrate</h1>
                            <p className="mt-3 text-[15px] text-zinc-400">Comienza tu prueba gratuita de 30 días.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-500/20 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-zinc-300">Nombre</label>
                                <input
                                    type="text"
                                    placeholder="Ingresa tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#161618] border border-zinc-600/80 rounded-[5px] px-3 py-[9px] text-[14px] text-white focus:outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 transition-all font-mono"
                                    required minLength={2}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-zinc-300">Correo electrónico</label>
                                <input
                                    type="email"
                                    placeholder="Ingresa tu correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#161618] border border-zinc-600/80 rounded-[5px] px-3 py-[9px] text-[14px] text-white focus:outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 transition-all font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-zinc-300">Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Crea una contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#161618] border border-zinc-600/80 rounded-[5px] px-3 py-[9px] text-[14px] text-white focus:outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 transition-all font-mono"
                                    required minLength={8}
                                />
                                <p className="text-xs text-zinc-500 mt-1.5 pt-1">Debe tener al menos 8 caracteres.</p>
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 text-[14px] font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center shadow-md shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creando cuenta...' : 'Comenzar'}
                                </button>

                                <button
                                    type="button"
                                    className="w-full py-2.5 flex justify-center items-center gap-2 text-[15px] font-medium text-white bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 rounded-lg transition-colors shadow-sm"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Sign up with Google
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-[15px] text-center text-zinc-400">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="font-semibold text-white hover:text-zinc-300 transition-colors">
                                Iniciar sesión
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Column: Glassmorphism Testimonial Container (Hidden on mobile) */}
                <div className="hidden lg:flex flex-col justify-end w-full h-full p-8 xl:p-12 pb-24 items-end">
                    {/* Glassmorphism Testimonial Card */}
                    <div className="relative z-10 w-full max-w-lg mb-8">
                        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-6 text-white">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            
                            {/* Quote */}
                            <h2 className="text-2xl font-medium text-white mb-8 tracking-tight leading-snug">
                                "Hemos estado usando AeroDB para impulsar cada nuevo proyecto y no podemos imaginar trabajar sin él. Es increíble."
                            </h2>

                            {/* Author Info */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Caitlyn King</h3>
                                    <p className="text-sm text-zinc-300">Diseñadora principal, Layers</p>
                                    <p className="text-xs text-zinc-400 mt-1">Agencia de Desarrollo Web</p>
                                </div>
                                
                                {/* Navigation Circled Buttons mockups */}
                                <div className="flex gap-4">
                                    <button type="button" className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </button>
                                    <button type="button" className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
