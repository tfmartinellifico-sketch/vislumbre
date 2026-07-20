"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";
import { HERO_VISUAL } from "@/lib/landing-copy";

/**
 * Hero visual — perfil ¾ editorial (sem olhar frontal).
 * Diagramas de clínica estética evitam o “olho de cartoon”.
 */
export function HeroVisual() {
  return (
    <div className="relative h-full min-h-[44vh] w-full overflow-hidden lg:min-h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-sea-deep via-[#1a4540] to-ink" />

      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,252,251,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(250,252,251,0.12) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 60% 40%, rgba(107,154,144,0.32), transparent 60%), radial-gradient(ellipse 45% 40% at 20% 80%, rgba(203,184,154,0.2), transparent 50%)",
        }}
      />

      <div className="absolute left-6 top-8 md:left-10 md:top-12">
        <LogoMark size={36} ink="#fafcfb" accent="#6b9a90" soft="#cbb89a" />
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center p-6 md:p-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg
          viewBox="0 0 420 540"
          className="h-full max-h-[min(74vh,660px)] w-auto max-w-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="skin3q" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
              <stop offset="0%" stopColor="#f3e6d8" />
              <stop offset="40%" stopColor="#e4cdb5" />
              <stop offset="100%" stopColor="#c4a182" />
            </linearGradient>
            <linearGradient id="hair3q" x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#2c2420" />
              <stop offset="100%" stopColor="#1a1512" />
            </linearGradient>
            <linearGradient id="volSoft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8fb5ac" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8fb5ac" stopOpacity="0.05" />
            </linearGradient>
            <filter id="softEdge" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
            </filter>
          </defs>

          {/* guia oval discreto */}
          <ellipse
            cx="215"
            cy="275"
            rx="168"
            ry="210"
            fill="none"
            stroke="rgba(203,184,154,0.18)"
            strokeWidth="1"
          />

          {/* cabelo — massa suave atrás / topo */}
          <path
            d="M118 200
               C95 150, 110 95, 168 78
               C220 62, 290 78, 318 130
               C335 165, 340 210, 332 250
               C325 220, 300 185, 255 170
               C200 155, 145 170, 125 210 Z"
            fill="url(#hair3q)"
            opacity="0.92"
          />

          {/* pescoço */}
          <path
            d="M175 400 C185 430, 195 460, 198 490 L248 490 C252 455, 258 425, 265 400 Z"
            fill="url(#skin3q)"
            opacity="0.85"
          />

          {/*
            Perfil ¾ — contorno clássico:
            fronte → nariz → lábios → mento → mandíbula → orelha
            Sem pupilas frontais.
          */}
          <path
            d="M155 195
               C160 130, 195 95, 235 88
               C270 85, 300 105, 312 145
               C318 170, 320 195, 315 218
               C328 235, 335 255, 332 278
               C330 295, 322 308, 308 318
               C318 328, 322 340, 318 352
               C312 372, 295 390, 270 402
               C245 415, 215 418, 190 408
               C165 395, 148 365, 145 330
               C142 290, 145 245, 155 195 Z"
            fill="url(#skin3q)"
          />

          {/* sombra lateral (profundidade ¾) */}
          <path
            d="M250 110
               C280 120, 300 160, 305 210
               C308 250, 300 290, 285 320
               C270 350, 245 375, 215 385
               C235 370, 255 340, 265 305
               C275 265, 278 220, 270 175
               C262 140, 255 120, 250 110 Z"
            fill="#b89578"
            opacity="0.18"
          />

          {/* orelha (lado visível no ¾) */}
          <path
            d="M148 240 C138 245, 132 265, 138 285 C145 300, 158 298, 162 285 C165 270, 160 250, 148 240 Z"
            fill="#dfc4ad"
            opacity="0.9"
          />

          {/* sobrancelha — só a visível, traço fino */}
          <path
            d="M248 168 Q268 160, 288 168"
            fill="none"
            stroke="#5c4a3e"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* olho fechado / olhar baixo — linha suave, sem iris */}
          <path
            d="M252 188 Q270 182, 288 190"
            fill="none"
            stroke="#5c4a3e"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.45"
          />
          <path
            d="M255 192 Q270 196, 285 192"
            fill="none"
            stroke="#5c4a3e"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.25"
          />

          {/* nariz em ¾ */}
          <path
            d="M298 195
               C305 220, 312 245, 308 268
               C304 278, 295 282, 288 278"
            fill="none"
            stroke="#9a7358"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* lábios — curva discreta de perfil */}
          <path
            d="M278 318 C290 322, 300 328, 305 335"
            fill="none"
            stroke="#b87870"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
          <path
            d="M278 328 C292 332, 300 336, 304 340"
            fill="none"
            stroke="#b87870"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* contorno iluminado */}
          <path
            className="contour-draw"
            d="M155 195
               C160 130, 195 95, 235 88
               C270 85, 300 105, 312 145
               C318 170, 320 195, 315 218
               C328 235, 335 255, 332 278
               C330 295, 322 308, 308 318
               C318 328, 322 340, 318 352
               C312 372, 295 390, 270 402
               C245 415, 215 418, 190 408
               C165 395, 148 365, 145 330
               C142 290, 145 245, 155 195 Z"
            fill="none"
            stroke="rgba(250,252,251,0.28)"
            strokeWidth="1.2"
          />

          {/* volume malar — arco clínico, não mancha */}
          <motion.path
            d="M255 250
               C275 245, 295 255, 300 275
               C295 295, 270 300, 250 290
               C245 270, 248 255, 255 250 Z"
            fill="url(#volSoft)"
            stroke="rgba(143,181,172,0.7)"
            strokeWidth="1.3"
            strokeDasharray="6 5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          />

          {/* volume mandíbula / mento */}
          <motion.path
            d="M210 360
               C240 355, 275 365, 285 385
               C270 400, 235 405, 205 395
               C200 380, 205 365, 210 360 Z"
            fill="url(#volSoft)"
            stroke="rgba(143,181,172,0.55)"
            strokeWidth="1.1"
            strokeDasharray="5 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          />

          {/* linhas de análise — terços */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.7 }}
          >
            <line
              x1="175"
              y1="145"
              x2="300"
              y2="145"
              stroke="rgba(203,184,154,0.3)"
              strokeWidth="0.7"
              strokeDasharray="3 5"
            />
            <line
              x1="165"
              y1="250"
              x2="315"
              y2="250"
              stroke="rgba(203,184,154,0.3)"
              strokeWidth="0.7"
              strokeDasharray="3 5"
            />
            <line
              x1="160"
              y1="355"
              x2="290"
              y2="355"
              stroke="rgba(203,184,154,0.3)"
              strokeWidth="0.7"
              strokeDasharray="3 5"
            />
            <path
              d="M260 248 L290 220 L305 255"
              fill="none"
              stroke="rgba(107,154,144,0.5)"
              strokeWidth="0.9"
              strokeDasharray="4 3"
            />
          </motion.g>

          {/* pontos de marcação */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            {[
              [270, 265],
              [290, 280],
              [250, 375],
              [275, 390],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2.5"
                fill="#6b9a90"
                opacity="0.85"
              />
            ))}
          </motion.g>
        </svg>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent px-6 pb-8 pt-16 md:px-10 md:pb-10">
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
