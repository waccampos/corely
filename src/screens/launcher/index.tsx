import { useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useApp } from "@/context/AppContext";
import { useApps, LauncherItem, ExtensionEntry, ClipboardEntry } from "@/hooks/useApps";
import { useLauncherKeys } from "@/hooks/useLauncherKeys";
import { AppIcon } from "@/components/AppIcon";
import { Kbd } from "@/components/ui/kbd";
import { Search, X, ChevronRight } from "@/icons";
import { cn } from "@/common/utils";
import { ClipItem } from "../clipboard/types.clipboard";

const SYSTEM_ICONS: Record<string, string> = {
  "system.shutdown": "🔴",
  "system.reboot": "🔄",
  "system.suspend": "💤",
  "system.volume.0": "🔇",
  "system.volume.10": "🔈",
  "system.volume.20": "🔈",
  "system.volume.30": "🔈",
  "system.volume.40": "🔉",
  "system.volume.50": "🔉",
  "system.volume.60": "🔉",
  "system.volume.70": "🔊",
  "system.volume.80": "🔊",
  "system.volume.90": "🔊",
  "system.volume.100": "🔊",
};

export function LauncherScreen() {
  const { compact, showIcons, exts, setScreen, fileSearch, maxResults } = useApp();
  const { apps, loading } = useApps();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [fileResults, setFileResults] = useState<LauncherItem[]>([]);
  const [clipHistory, setClipHistory] = useState<ClipItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    invoke<ClipItem[]>("get_clipboard_history")
      .then(setClipHistory)
      .catch(() => {});
  }, []);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  useEffect(() => {
    const focusInput = () => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      // Forces WebKitGTK to commit native input state after programmatic focus,
      // preventing the first keypress from being swallowed.
      el.setSelectionRange(el.value.length, el.value.length);
    };
    requestAnimationFrame(() => requestAnimationFrame(focusInput));
    window.addEventListener("focus", focusInput);
    return () => window.removeEventListener("focus", focusInput);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!fileSearch || q.length < 2) { setFileResults([]); return; }
    const timer = setTimeout(() => {
      invoke<LauncherItem[]>("search_files", { query: q })
        .then(setFileResults)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fileSearch]);

  const q = query.trim().toLowerCase();

  const appFiltered = useMemo(() => {
    if (!q) return apps;
    const matchedApps = apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        ("description" in a ? a.description ?? "" : "").toLowerCase().includes(q)
    );
    return [...matchedApps, ...fileResults];
  }, [q, apps, fileResults]);

  const activeExtEntries = useMemo((): ExtensionEntry[] =>
    exts
      .filter((e) => e.enabled && (!q || e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q)))
      .map((e) => ({
        type: "extension" as const,
        id: String(e.id),
        name: e.name,
        desc: e.desc,
        emoji: e.emoji,
        color: e.color,
        screen: e.screen,
      })),
    [exts, q]
  );

  const clipEntries = useMemo((): ClipboardEntry[] =>
    clipHistory
      .filter((c) => !q || c.content.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({
        type: "clipboard" as const,
        id: String(c.id),
        name: c.content,
        content: c.content,
      })),
    [clipHistory, q]
  );

  const groups = useMemo(() => {
    const buckets: Record<string, LauncherItem[]> = {};
    appFiltered.forEach((a) => {
      const cat =
        a.type === "app" ? "Aplicativos" :
        a.type === "system" ? "Sistema" :
        (a as { isDir?: boolean }).isDir ? "Pastas" : "Arquivos";
      if (!buckets[cat]) buckets[cat] = [];
      buckets[cat].push(a);
    });

    // Ordem de exibição: Aplicativos → Extensões → Sistema/Pastas/Arquivos → Clipboard
    const g: Record<string, LauncherItem[]> = {};
    if (buckets["Aplicativos"]) g["Aplicativos"] = buckets["Aplicativos"].slice(0, maxResults);
    if (activeExtEntries.length > 0) g["Extensões"] = activeExtEntries.slice(0, maxResults);
    for (const cat of ["Sistema", "Pastas", "Arquivos"] as const) {
      if (buckets[cat]) g[cat] = buckets[cat].slice(0, maxResults);
    }
    if (clipEntries.length > 0) g["Clipboard"] = clipEntries.slice(0, maxResults);
    return g;
  }, [appFiltered, activeExtEntries, clipEntries, maxResults]);

  const allFiltered = useMemo(() => Object.values(groups).flat(), [groups]);

  useEffect(() => setSelected(0), [query]);

  const openApp = (item: LauncherItem) => {
    if (item.type === "extension") {
      if (item.screen) setScreen(item.screen as Parameters<typeof setScreen>[0]);
      return;
    }
    if (item.type === "clipboard") {
      invoke("write_clipboard", { text: item.content });
      invoke("hide_window");
      return;
    }
    const exec = item.type === "file" ? item.path : (item as { exec: string }).exec;
    invoke("launch_app", { id: item.id, exec });
    invoke("hide_window");
  };

  const handleKey = useLauncherKeys({
    filtered: allFiltered,
    selected,
    query,
    setSelected,
    setQuery,
    openApp,
  });

  const itemPy = compact ? "py-1" : "py-2";
  const iconSize = compact ? 26 : 32;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <Search size={15} className="text-zinc-500 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Buscar apps, arquivos, ações..."
          className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-500 outline-none caret-[var(--accent-color)]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
        <Kbd>⌘K</Kbd>
      </div>

      <div className="flex-1 overflow-y-auto pb-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-zinc-600 animate-pulse">Carregando apps...</span>
          </div>
        ) : allFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600">
            <Search size={24} />
            <span className="text-sm">
              Sem resultados para <em>"{query}"</em>
            </span>
          </div>
        ) : (
          Object.entries(groups).map(([cat, items]) => (
            <div key={cat}>
              <div className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase text-zinc-600 font-mono">
                {cat}
              </div>
              {items.map((item) => {
                const idx = allFiltered.indexOf(item);
                const sel = idx === selected;
                const subtitle =
                  item.type === "extension"
                    ? item.desc
                    : "description" in item
                    ? item.description
                    : null;

                return (
                  <div
                    key={item.id}
                    ref={sel ? selectedRef : null}
                    onMouseEnter={() => setSelected(idx)}
                    onClick={() => openApp(item)}
                    className={cn(
                      "flex items-center gap-3 px-4 cursor-default transition-all duration-75 border-l-2",
                      itemPy,
                      sel
                        ? "bg-[var(--accent-dim)] border-l-[var(--accent-color)]"
                        : "border-l-transparent"
                    )}
                  >
                    {item.type === "extension" ? (
                      <div
                        className="shrink-0 flex items-center justify-center rounded-lg text-lg"
                        style={{ width: iconSize, height: iconSize, background: item.color + "20" }}
                      >
                        {item.emoji}
                      </div>
                    ) : item.type === "clipboard" ? (
                      <div
                        className="shrink-0 flex items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm"
                        style={{ width: iconSize, height: iconSize }}
                      >
                        📋
                      </div>
                    ) : item.type === "system" ? (
                      <div
                        className="shrink-0 flex items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm"
                        style={{ width: iconSize, height: iconSize }}
                      >
                        {SYSTEM_ICONS[item.id] ?? "⚙️"}
                      </div>
                    ) : (
                      showIcons && <AppIcon app={item} size={iconSize} />
                    )}

                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium truncate",
                          sel
                            ? "text-[var(--accent-color)]"
                            : "text-zinc-600 dark:text-zinc-100"
                        )}
                      >
                        {item.name}
                      </div>
                      {!compact && subtitle && (
                        <div className="text-xs text-zinc-500 truncate mt-0.5">
                          {subtitle}
                        </div>
                      )}
                    </div>
                    {sel && <ChevronRight size={14} className="text-zinc-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="h-9 border-t border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-4 shrink-0">
        {(
          [["↑↓", "navegar"], ["↵", "abrir"], ["Esc", "limpar"]] as const
        ).map(([k, l]) => (
          <div key={k} className="flex items-center gap-1.5">
            <Kbd>{k}</Kbd>
            <span className="text-[10px] text-zinc-600">{l}</span>
          </div>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-600 font-mono">
          {allFiltered.length} resultados
        </span>
      </div>
    </div>
  );
}
