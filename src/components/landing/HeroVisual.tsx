"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";
import { HERO_VISUAL } from "@/lib/landing-copy";

/** Ilustração editorial — rosto legível, volumes só em regiões de consulta. */
export function HeroVisual() {
  return (
    <div className="relative h-full min-h-[44vh] w-full overflow-hidden lg:min-h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-sea-deep via-[#1a4540] to-ink" />

      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,252,251,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(250,252,251,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

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
            <linearGradient id="heroSkin" x1="0.25" y1="0" x2="0.75" y2="1">
              <stop offset="0%" stopColor="#f7ede4" />
              <stop offset="50%" stopColor="#e8d4c0" />
              <stop offset="100%" stopColor="#c9a88a" />
            </linearGradient>
            <linearGradient id="heroShadow" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#b89578" stopOpacity="0" />
              <stop offset="100%" stopColor="#9a7358" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="heroVol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fb5ac" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8fb5ac" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="heroCheekL" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4b89a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d4b89a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heroCheekR" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4b89a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d4b89a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* halo guia */}
          <ellipse
            cx="200"
            cy="268"
            rx="158"
            ry="198"
            fill="none"
            stroke="rgba(203,184,154,0.22)"
            strokeWidth="1"
          />

          {/* cabelo / contorno superior */}
          <path
            d="M108 210 C112 130, 168 88, 200 82 C232 88, 288 130, 292 210 C285 175, 248 148, 200 145 C152 148, 115 175, 108 210 Z"
            fill="#3d3028"
            opacity="0.55"
          />

          {/* cabeça */}
          <path
            d="M118 175 C125 115, 168 92, 200 90 C232 92, 275 115, 282 175 C292 235, 295 310, 278 375 C258 430, 218 448, 200 452 C182 448, 142 430, 122 375 C105 310, 108 235, 118 175 Z"
            fill="url(#heroSkin)"
          />
          <path
            d="M118 175 C125 115, 168 92, 200 90 C232 92, 275 115, 282 175 C292 235, 295 310, 278 375 C258 430, 218 448, 200 452 C182 448, 142 430, 122 375 C105 310, 108 235, 118 175 Z"
            fill="url(#heroShadow)"
          />

          {/* sombra mandíbula */}
          <ellipse cx="200" cy="400" rx="72" ry="28" fill="#b89578" opacity="0.12" />

          {/* blush natural */}
          <ellipse cx="148" cy="268" rx="34" ry="22" fill="url(#heroCheekL)" />
          <ellipse cx="252" cy="268" rx="34" ry="22" fill="url(#heroCheekR)" />

          {/* sobrancelhas */}
          <path
            d="M148 198 Q168 188, 182 192"
            fill="none"
            stroke="#6b5344"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M218 192 Q232 188, 252 198"
            fill="none"
            stroke="#6b5344"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* olhos — formato definido, sem blur */}
          <g opacity="0.88">
            <ellipse cx="165" cy="222" rx="18" ry="11" fill="#faf8f5" />
            <ellipse cx="235" cy="222" rx="18" ry="11" fill="#faf8f5" />
            <ellipse cx="166" cy="223" rx="9" ry="9" fill="#4a4038" />
            <ellipse cx="236" cy="223" rx="9" ry="9" fill="#4a4038" />
            <circle cx="169" cy="220" r="2.5" fill="#fafcfb" opacity="0.9" />
            <circle cx="239" cy="220" r="2.5" fill="#fafcfb" opacity="0.9" />
          </g>

          {/* nariz suave */}
          <path
            d="M200 228 L192 268 Q200 274, 208 268 Z"
            fill="#c9a88a"
            opacity="0.35"
          />
          <path
            d="M200 228 Q196 252, 194 268 M200 228 Q204 252, 206 268"
            fill="none"
            stroke="#9a7358"
            strokeWidth="1"
            opacity="0.35"
            strokeLinecap="round"
          />

          {/* lábios */}
          <path
            d="M178 318 Q200 332, 222 318 Q200 326, 178 318 Z"
            fill="#c4847a"
            opacity="0.55"
          />
          <path
            d="M178 318 Q200 324, 222 318"
            fill="none"
            stroke="#a66b62"
            strokeWidth="1"
            opacity="0.45"
          />

          {/* orelhas discretas */}
          <ellipse cx="112" cy="258" rx="10" ry="18" fill="#dfc4ad" opacity="0.85" />
          <ellipse cx="288" cy="258" rx="10" ry="18" fill="#dfc4ad" opacity="0.85" />

          {/* contorno */}
          <path
            className="contour-draw"
            d="M118 175 C125 115, 168 92, 200 90 C232 92, 275 115, 282 175 C292 235, 295 310, 278 375 C258 430, 218 448, 200 452 C182 448, 142 430, 122 375 C105 310, 108 235, 118 175 Z"
            fill="none"
            stroke="rgba(250,252,251,0.35)"
            strokeWidth="1.2"
          />

          {/* volumes de consulta (malar / sulco) — tracejados, fora dos olhos/boca */}
          <motion.ellipse
            cx="148"
            cy="278"
            rx="36"
            ry="26"
            fill="url(#heroVol)"
            stroke="rgba(107,154,144,0.55)"
            strokeWidth="1.2"
            strokeDasharray="5 4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.85, duration: 0.7 }}
          />
          <motion.ellipse
            cx="252"
            cy="278"
            rx="36"
            ry="26"
            fill="url(#heroVol)"
            stroke="rgba(107,154,144,0.55)"
            strokeWidth="1.2"
            strokeDasharray="5 4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.95, duration: 0.7 }}
          />
          <motion.ellipse
            cx="200"
            cy="348"
            rx="52"
            ry="18"
            fill="url(#heroVol)"
            stroke="rgba(107,154,144,0.45)"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ delay: 1.05, duration: 0.7 }}
          />

          {/* linhas de análise — terço médio */}
          <motion.path
            d="M148 278 L200 248 L252 278"
            fill="none"
            stroke="rgba(107,154,144,0.45)"
            strokeWidth="0.9"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          />
          <motion.line
            x1="118"
            y1="248"
            x2="282"
            y2="248"
            stroke="rgba(203,184,154,0.35)"
            strokeWidth="0.7"
            strokeDasharray="3 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.35, duration: 0.6 }}
          />
        </svg>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-6 pb-8 pt-16 md:px-10 md:pb-10">
        <p className="text-[10px] uppercase tracking-[0.24em] text-sand">
          {HERO_VISUAL.caption}
        </p>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-mist/90">
          {HERO_VISUAL.note}
        </p>
      </div>
    </div>
  );
}
