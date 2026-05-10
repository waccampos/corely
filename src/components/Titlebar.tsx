import { useApp } from "@/context/AppContext";
import { Zap, SettingsIcon } from "@/icons";

export function Titlebar() {
  const { theme, accent, screen, setScreen } = useApp();

  return (
    <div
      className="h-[42px] border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 shrink-0 select-none"
      style={{ background: theme === "dark" ? "#111113" : "#f4f4f5" }}
      data-tauri-drag-region
    >
      <div className="w-[60px]" />
      <div className="flex-1 flex justify-center items-center gap-2">
        <Zap size={13} style={{ color: accent }} />
        <span
          className="font-extrabold text-xs tracking-widest"
          style={{ color: accent }}
        >
          CORELY
        </span>
        <span className="text-zinc-500 text-[11px]">·</span>
        <span className="text-zinc-500 text-[11px] font-mono">{screen}</span>
      </div>
      <button
        aria-label="Configurações"
        onClick={() => setScreen("settings")}
        className="flex items-center justify-center p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
      >
        <SettingsIcon size={15} />
      </button>
    </div>
  );
}
