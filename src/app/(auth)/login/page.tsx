'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        <div className="flex items-center justify-center min-h-screen bg-zinc-950">
            <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">Inicia sesión en AERO</h1>
                    <p className="mt-2 text-sm text-zinc-400">¡Bienvenido de nuevo! Por favor, ingresa tus datos.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-zinc-300">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 text-white bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 text-white bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 mt-4 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="text-sm text-center text-zinc-400">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                        Regístrate
                    </Link>
                </p>
            </div>
        </div>
    );
}
