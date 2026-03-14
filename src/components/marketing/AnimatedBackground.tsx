"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 z-[-1] bg-black" />;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black w-screen h-screen">
      
      {/* Framer Motion Glowing Orbs (Premium Vercel Aesthetic) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, -80, 0],
          y: [0, 80, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-zinc-400/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Subtle Grid Overlay to maintain the technical aesthetic */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"
        style={{
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)"
        }}
      >
      </div>

      {/* Fade out edges to black */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_100px_black] pointer-events-none" />
    </div>
  );
}
