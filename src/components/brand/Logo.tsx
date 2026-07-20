"use client";

import Link from "next/link";

export type LogoFont = "cormorant" | "instrument" | "dm" | "fraunces";

type Props = {
  markOnly?: boolean;
  wordOnly?: boolean;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg" | "hero";
  font?: LogoFont;
  href?: string;
  className?: string;
};

const sizes = {
  sm: { mark: 26, gap: 8, word: "text-[1.05rem]" },
  md: { mark: 32, gap: 10, word: "text-[1.35rem]" },
  lg: { mark: 40, gap: 12, word: "text-[1.65rem]" },
  hero: { mark: 52, gap: 14, word: "text-[2.05rem]" },
};

const fontClass: Record<LogoFont, string> = {
  cormorant: "font-logo-cormorant font-semibold",
  instrument: "font-logo-instrument",
  dm: "font-logo-dm",
  fraunces: "font-logo-fraunces font-medium",
};

export function Logo({
  markOnly = false,
  wordOnly = false,
  variant = "dark",
  size = "md",
  font = "cormorant",
  href,
  className = "",
}: Props) {
  const s = sizes[size];
  const ink = variant === "light" ? "#fafcfb" : "#0e1615";
  const accent = variant === "light" ? "#cbb89a" : "#245750";
  const soft = "#6b9a90";

  const mark = (
    <LogoMark size={s.mark} ink={ink} accent={accent} soft={soft} />
  );

  const word = (
    <span
      className={`${fontClass[font]} tracking-[-0.02em] leading-none ${s.word} ${
        variant === "light" ? "text-paper" : "text-ink"
      }`}
    >
      Vislumbre
    </span>
  );

  const inner = (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ gap: s.gap }}
    >
      {!wordOnly && mark}
      {!markOnly && word}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {inner}
      </Link>
    );
  }

  return inner;
}

export function LogoMark({
  size = 32,
  ink = "#0e1615",
  accent = "#245750",
  soft = "#6b9a90",
}: {
  size?: number;
  ink?: string;
  accent?: string;
  soft?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M24 4 C12 4 4 14 4 24 C4 34 12 44 24 44 C36 44 44 34 44 24"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 24 C44 14 36 4 24 4"
        stroke={soft}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M16 18 C16 14 20 11 24 11 C28 11 32 14 32 18 C32 22 30 26 28 30 C26 34 24 37 24 37 C24 37 22 34 20 30 C18 26 16 22 16 18 Z"
        stroke={ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill={`${accent}18`}
      />
      <circle cx="24" cy="22" r="2.2" fill={accent} opacity="0.85" />
      <path
        d="M19 24 C21 26 27 26 29 24"
        stroke={soft}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
