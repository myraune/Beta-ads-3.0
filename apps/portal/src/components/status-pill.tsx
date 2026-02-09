import type { ReactNode } from "react";

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-slate-600/70 bg-slate-900/70 text-slate-200",
  info: "border-cyan-300/40 bg-cyan-500/10 text-cyan-100",
  success: "border-emerald-300/40 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-300/40 bg-amber-500/10 text-amber-100",
  danger: "border-rose-300/40 bg-rose-500/10 text-rose-100"
};

export interface StatusPillProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

export function StatusPill({ tone = "neutral", children, className }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${TONE_CLASSES[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
