"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";

export function HeroSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="container px-4 mx-auto relative z-10 flex flex-col items-center text-center">
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm text-zinc-300">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Aero DBaaS 1.0 ya está disponible
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={item}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Despliega Postgres en Segundos. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
              La Base de Datos priorizando el Código.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={item}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
          >
            Experimenta la próxima generación de PostgreSQL serverless. Ramificación, escalamiento infinito y compatibilidad edge nativa construida para desarrolladores modernos.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-zinc-200 group text-base font-medium">
                Comenzar gratis
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <Link href="/docs">
              <Button size="lg" variant="outline" className="h-12 border-white/10 hover:bg-white/5 bg-transparent text-white group text-base font-medium">
                <Terminal className="mr-2 w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                Leer la Documentación
              </Button>
            </Link>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
