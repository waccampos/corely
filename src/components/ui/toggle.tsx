import { cn } from "@/common/utils";

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "flex-1 py-2 rounded-lg border text-xs font-medium transition-all",
        value
          ? "border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent-color)]"
          : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300"
      )}
    >
      {label}
    </button>
  );
}

