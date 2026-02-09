import { clsx } from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function Button(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { className, children, ...rest } = props;
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        "bg-slate-900 text-white",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className)}>{children}</section>;
}
