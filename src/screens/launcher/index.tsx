import { useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useApp } from "@/context/AppContext";
import { useApps, LauncherItem } from "@/hooks/useApps";
import { useLauncherKeys } from "@/hooks/useLauncherKeys";
import { AppIcon } from "@/components/AppIcon";
import { Kbd } from "@/components/ui/kbd";
import { Search, X, ChevronRight } from "@/icons";
import { cn } from "@/common/utils";

export function LauncherScreen() {
  const { compact, showIcons } = useApp();
  const { apps, loading } = useApps();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [fileResults, setFileResults] = useState<LauncherItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

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
    if (q.length < 2) {
      setFileResults([]);
      return;
    }
    const timer = setTimeout(() => {
      invoke<LauncherItem[]>("search_files", { query: q })
        .then(setFileResults)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    const matchedApps = apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        ("description" in a ? a.description ?? "" : "").toLowerCase().includes(q)
    );
    return [...matchedApps, ...fileResults];
  }, [query, apps, fileResults]);

  const groups = useMemo(() => {
    const g: Record<string, LauncherItem[]> = {};
    filtered.forEach((a) => {
      const cat =
        a.type === "app" ? "Aplicativos" :
        a.type === "system" ? "Sistema" :
        a.isDir ? "Pastas" : "Arquivos";
      if (!g[cat]) g[cat] = [];
      g[cat].push(a);
    });
    return g;
  }, [filtered]);

  useEffect(() => setSelected(0), [query]);

  const openApp = (app: LauncherItem) => {
    const exec = app.type === "file" ? app.path : app.exec;
    invoke("launch_app", { id: app.id, exec });
    invoke("hide_window");
  };

  const handleKey = useLauncherKeys({ filtered, selected, query, setSelected, setQuery, openApp });

  const itemPy = compact ? "py-1" : "py-2";

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
        ) : filtered.length === 0 ? (
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
                const idx = filtered.indexOf(item);
                const sel = idx === selected;
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
                    {showIcons && <AppIcon app={item} size={compact ? 26 : 32} />}
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium truncate",
                          sel ? "text-[var(--accent-color)]" : "text-zinc-600 dark:text-zinc-100"
                        )}
                      >
                        {item.name}
                      </div>
                      {!compact && "description" in item && item.description && (
                        <div className="text-xs text-zinc-500 truncate mt-0.5">
                          {item.description}
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
          [["↑↓", "navegar"], ["↵", "abrir"], ["⌘K", "ações"], ["Esc", "limpar"]] as const
        ).map(([k, l]) => (
          <div key={k} className="flex items-center gap-1.5">
            <Kbd>{k}</Kbd>
            <span className="text-[10px] text-zinc-600">{l}</span>
          </div>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-600 font-mono">
          {filtered.length} resultados
        </span>
      </div>
    </div>
  );
}
