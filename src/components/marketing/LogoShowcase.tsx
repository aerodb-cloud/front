"use client";

import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const logos = [
  { name: "Microsoft", url: "https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/microsoft-white200.svg", width: 201, height: 200 },
  { name: "Cloudflare", url: "https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/cloudflareword-white200.svg", width: 200, height: 200 },
  { name: "Accenture", url: "https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/accenture-white200.svg", width: 201, height: 200 },
  { name: "Fanatics", url: "https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/fanatics-white200.svg", width: 201, height: 200 },
  { name: "Kong", url: "https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/kong-white200.svg", width: 201, height: 200 },
  { name: "ASICS", url: "https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/Asics logo.svg", width: 200, height: 67 },
];

function Crosshair({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="21" stroke="currentColor" viewBox="0 0 20 21" width="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0.332031V20.332" stroke="var(--color-border)"></path>
      <path d="M0 10.332L20 10.332" stroke="var(--color-border)"></path>
    </svg>
  );
}

export function LogoShowcase() {
  return (
    <section className="w-full relative py-24 overflow-hidden">
      <Container className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 relative border-t border-b border-white/5 py-12">
        {/* Left Text Segment */}
        <div className="flex flex-col justify-center pr-8 lg:border-r border-white/5 relative">
          <p className="text-xl md:text-2xl font-medium text-zinc-300 tracking-tight max-w-sm">
            AeroDB is the serverless PostgreSQL platform used in production by the world&apos;s most innovative developer teams.
          </p>
        </div>

        {/* Right Logo Grid */}
        <div className="relative isolate">
          <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[120px]">
            {logos.map((logo, idx) => (
              <div 
                key={logo.name} 
                className="relative flex items-center justify-center border-l border-t border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors p-8 group"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="relative w-full h-[40px] flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                >
                  {/* Next.js unoptimized to allow external links easily for now */}
                  <img
                    src={logo.url}
                    alt={`${logo.name} logo`}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                </motion.div>
                
                {/* Subtle overlay reflection line / "scanline" effect placeholder */}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_200%] animate-pulse" />
              </div>
            ))}
          </div>

          {/* Grid Intersections / Crosshairs */}
          <Crosshair className="absolute -top-[10px] left-[33.33%] text-white/20 hidden md:block" />
          <Crosshair className="absolute -top-[10px] left-[66.66%] text-white/20 hidden md:block" />
          <Crosshair className="absolute top-[110px] -left-[10px] text-white/20" />
          <Crosshair className="absolute top-[110px] left-[33.33%] text-white/20 hidden md:block" />
          <Crosshair className="absolute top-[110px] left-[66.66%] text-white/20 hidden md:block" />
        </div>
      </Container>
    </section>
  );
}
