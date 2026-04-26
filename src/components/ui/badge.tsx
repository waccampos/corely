import { ReactNode } from "react";
import { cn } from "@/common/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase font-mono border",
        variant === "default" && "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300",
        variant === "accent"  && "border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent-color)]",
        variant === "outline" && "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
