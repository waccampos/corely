import { invoke } from "@tauri-apps/api/core";
import { LauncherItem } from "@/hooks/useApps";

interface Options {
  filtered: LauncherItem[];
  selected: number;
  query: string;
  setSelected: (fn: (s: number) => number) => void;
  setQuery: (q: string) => void;
  openApp: (app: LauncherItem) => void;
}

export function useLauncherKeys({
  filtered,
  selected,
  query,
  setSelected,
  setQuery,
  openApp,
}: Options) {
  
  return (e: React.KeyboardEvent) => {
      console.log(e.key);
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && filtered[selected]) openApp(filtered[selected]);
  };
}
