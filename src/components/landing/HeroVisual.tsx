"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";

export function HeroVisual() {
  return (
    <div className="relative h-full min-h-[44vh] w-full overflow-hidden lg:min-h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-sea-deep via-[#1a4540] to-ink" />

      {/* grade sutil */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,252,251,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(250,252,251,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* brilho */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 55% 35%, rgba(107,154,144,0.35), transparent 65%), radial-gradient(ellipse 40% 35% at 15% 85%, rgba(203,184,154,0.25), transparent 50%)",
        }}
      />

      <div className="absolute left-6 top-8 md:left-10 md:top-12">
        <LogoMark size={36} ink="#fafcfb" accent="#6b9a90" soft="#cbb89a" />
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg
          viewBox="0 0 400 520"
          className="h-full max-h-[min(72vh,640px)] w-auto max-w-full float-soft drop-shadow-[0_40px_80px_rgba(0,0,0,0.35)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="heroSkin" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#f5ebe0" />
              <stop offset="45%" stopColor="#dcc4aa" />
              <stop offset="100%" stopColor="#b89578" />
            </linearGradient>
            <linearGradient id="heroVol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fb5ac" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#8fb5ac" stopOpacity="0" />
            </linearGradient>
            <filter id="heroGlow">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* halo */}
          <ellipse
            cx="200"
            cy="255"
            rx="155"
            ry="200"
            fill="none"
            stroke="rgba(203,184,154,0.25)"
            strokeWidth="1"
          />

          {/* rosto */}
          <ellipse cx="200" cy="255" rx="128" ry="168" fill="url(#heroSkin)" />

          {/* contorno animado */}
          <path
            className="contour-draw"
            d="M118 145 C138 95, 262 95, 282 145 C305 210, 310 310, 285 385 C255 455, 145 455, 115 385 C90 310, 95 210, 118 145 Z"
            fill="none"
            stroke="rgba(250,252,251,0.55)"
            strokeWidth="1.5"
          />

          {/* volumes */}
          <motion.ellipse
            cx="158"
            cy="228"
            rx="38"
            ry="28"
            fill="url(#heroVol)"
            filter="url(#heroGlow)"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          />
          <motion.ellipse
            cx="242"
            cy="228"
            rx="38"
            ry="28"
            fill="url(#heroVol)"
            filter="url(#heroGlow)"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
          />
          <motion.ellipse
            cx="200"
            cy="318"
            rx="58"
            ry="22"
            fill="url(#heroVol)"
            opacity="0.85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          />

          {/* linhas de análise */}
          <motion.path
            d="M158 228 L200 200 L242 228"
            fill="none"
            stroke="rgba(107,154,144,0.5)"
            strokeWidth="0.8"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.2 }}
          />
        </svg>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-6 pb-8 pt-16 md:px-10 md:pb-10">
        <p className="text-[10px] uppercase tracking-[0.24em] text-sand">
          Visualização para conversa
        </p>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-mist/90">
          Contorno e volume alinhados à expectativa — nunca como resultado
          garantido.
        </p>
      </div>
    </div>
  );
}
