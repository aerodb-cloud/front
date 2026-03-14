"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Database className="w-6 h-6 text-white" />
          <span className="text-xl font-bold tracking-tight text-white">Aero DBaaS</span>
        </Link>
        
        {/* CENTER LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#product" className="hover:text-white transition-colors">Producto</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Documentación</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Precios</Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-black hover:bg-zinc-200">
              Comenzar
            </Button>
          </Link>
        </div>

      </div>
    </header>
  );
}
