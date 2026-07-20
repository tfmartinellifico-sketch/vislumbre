"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";
import { HERO_VISUAL } from "@/lib/landing-copy";

/**
 * Hero visual — ilustração editorial em line art (perfil),
 * servida como imagem estática em vez de SVG desenhado à mão.
 */
export function HeroVisual() {
  return (
    <div className="relative h-full min-h-[44vh] w-full overflow-hidden lg:min-h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-sea-deep via-[#1a4540] to-ink" />

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/illustrations/hero-profile.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-[center_30%]"
        />
      </motion.div>

      {/* vinheta para integrar a imagem ao layout */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 40%, transparent 55%, rgba(14,22,21,0.55) 100%)",
        }}
      />

      <div className="absolute left-6 top-8 md:left-10 md:top-12">
        <LogoMark size={36} ink="#fafcfb" accent="#6b9a90" soft="#cbb89a" />
      </div>

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
