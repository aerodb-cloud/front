'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Correo o contraseña inválidos');
            setLoading(false);
        } else {
            router.push('/projects');
            router.refresh();
        }
    };

    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-sans">
            {/* Absolute Background Video for the whole page */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 right-0 w-full lg:w-1/2 h-full object-cover opacity-60 pointer-events-none mix-blend-screen"
            >
                <source src="/videos/glass-animation-5.mp4" type="video/mp4" />
            </video>

            {/* Constrained layout grid */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen max-w-[1280px] mx-auto w-full">
                
                {/* Left Column: Form */}
                <div className="flex flex-col justify-center w-full h-full p-8 xl:p-12 pb-24 lg:pb-12 bg-black/60 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-r border-white/5">
                    
                    {/* Brand Header */}
                    <div className="absolute top-8 left-8 xl:left-12 flex items-center gap-2">
                        <Database className="w-6 h-6 text-white" />
                        <span className="text-xl font-bold tracking-tight text-white">Aero DBaaS</span>
                    </div>

                    <div className="w-full max-w-[400px] mx-auto mt-16 sm:mt-0">
                        <div className="mb-8">
                            <h1 className="text-3xl font-medium text-white tracking-tight">Iniciar sesión</h1>
                            <p className="mt-3 text-[15px] text-zinc-400">¡Bienvenido de nuevo! Por favor, ingresa tus datos.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-500/20 rounded-lg">
                                    {error}
                                </div>
                            )}

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
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#161618] border border-zinc-600/80 rounded-[5px] px-3 py-[9px] text-[14px] text-white focus:outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 transition-all font-mono"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 text-[14px] font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center shadow-md shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Iniciando sesión...' : 'Continuar'}
                                </button>

                                <button
                                    type="button"
                                    className="w-full py-2 text-[14px] font-semibold text-white bg-transparent border border-zinc-700/80 rounded-lg hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                                        <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.73 18.24 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.84 14.09H2.15V16.94C3.96 20.53 7.69 23 12 23Z" fill="#34A853"/>
                                        <path d="M5.84 14.1C5.62 13.44 5.5 12.74 5.5 12C5.5 11.26 5.62 10.56 5.84 9.91V7.06H2.15C1.41 8.54 1 10.22 1 12C1 13.78 1.41 15.46 2.15 16.94L5.84 14.1Z" fill="#FBBC05"/>
                                        <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.35 3.88C17.45 2.1 14.97 1 12 1C7.69 1 3.96 3.47 2.15 7.06L5.84 9.91C6.7 7.3 9.13 5.38 12 5.38Z" fill="#EA4335"/>
                                    </svg>
                                    Continuar con Google
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-[15px] text-center text-zinc-400">
                            ¿No tienes una cuenta?{' '}
                            <Link href="/register" className="font-semibold text-white hover:text-zinc-300 transition-colors">
                                Regístrate
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Column: Kept empty to display the unblocked video behind */}
                <div className="hidden lg:flex flex-col justify-end w-full h-full p-8 xl:p-12 pb-24 items-end">
                </div>

            </div>
        </div>
    );
}
