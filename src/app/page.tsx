import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect('/projects');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-zinc-950">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          Escala tu <span className="text-indigo-500">Postgres</span> a cero.
        </h1>
        <p className="text-xl text-zinc-400">
          AERO es una plataforma DBaaS moderna impulsada por Neon. Crea bases de datos Postgres serverless en segundos.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="px-8 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors"
          >
            Empezar gratis
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 text-sm font-semibold text-zinc-300 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
