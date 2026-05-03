import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ClipboardIcon, Search, Copy, Trash2, X } from "@/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/common/utils";

type ItemType = "code" | "url" | "text";

interface ClipItem {
  id: number;
  type: ItemType;
  content: string;
  timestamp: number;
}

const TYPE_STYLES: Record<ItemType, string> = {
  code: "text-[var(--accent-color)] bg-[var(--accent-dim)]",
  url:  "text-blue-400 bg-blue-400/10",
  text: "text-zinc-400 bg-zinc-700/50",
};

function relativeTime(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function ClipboardScreen() {
  const [items, setItems] = useState<ClipItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    const data = await invoke<ClipItem[]>("get_clipboard_history");
    setItems(data);
    setSelectedId(prev => prev ?? data[0]?.id ?? null);
  }, []);

  useEffect(() => {
    loadHistory();
    const unlisten = listen("clipboard-updated", loadHistory);
    return () => { unlisten.then(fn => fn()); };
  }, [loadHistory]);

  // Refresh relative timestamps every 30s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(
    () => !query ? items : items.filter(i => i.content.toLowerCase().includes(query.toLowerCase())),
    [query, items]
  );

  const sel = filtered.find(i => i.id === selectedId) ?? filtered[0] ?? null;

  async function remove(id: number) {
    const idx = filtered.findIndex(i => i.id === id);
    const next = filtered[idx + 1] ?? filtered[idx - 1] ?? null;
    await invoke("delete_clipboard_item", { id });
    setItems(prev => prev.filter(i => i.id !== id));
    if (next) setSelectedId(next.id);
  }

  async function copy(content: string) {
    try {
      await invoke("write_clipboard", { text: content });
    } catch {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function pasteNow(content: string) {
    try {
      await invoke("write_clipboard", { text: content });
    } catch {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    await invoke("hide_window");
  }

  void tick;

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = filtered.findIndex(i => i.id === sel?.id);
        const next = filtered[idx + 1];
        if (next) setSelectedId(next.id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = filtered.findIndex(i => i.id === sel?.id);
        const prev = filtered[idx - 1];
        if (prev) setSelectedId(prev.id);
      } else if (e.key === "Enter" && sel) {
        pasteNow(sel.content);
      } else if ((e.key === "Delete" || e.key === "Backspace") && query === "" && sel) {
        e.preventDefault();
        remove(sel.id);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sel, query]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <Search size={15} className="text-zinc-500 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar no histórico..."
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
        <span className="text-[10px] text-zinc-600 font-mono">{filtered.length} itens</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto shrink-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600">
              <ClipboardIcon size={22} />
              <span className="text-sm">
                {query ? "Nenhum resultado" : "Nenhum item no histórico"}
              </span>
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                ref={item.id === sel?.id ? selectedRef : null}
                onClick={() => { setSelectedId(item.id); inputRef.current?.focus(); }}
                className={cn(
                  "px-3 py-2.5 cursor-pointer border-b border-zinc-200/60 dark:border-zinc-800/60 border-l-2 transition-all duration-75",
                  sel?.id === item.id
                    ? "bg-[var(--accent-dim)] border-l-[var(--accent-color)]"
                    : "border-l-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono",
                    TYPE_STYLES[item.type]
                  )}>
                    {item.type}
                  </span>
                  <span className="text-[10px] text-zinc-600 ml-auto">
                    {relativeTime(item.timestamp)}
                  </span>
                </div>
                <div className={cn(
                  "text-xs truncate",
                  item.type === "code" ? "font-mono" : "",
                  sel?.id === item.id ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-500"
                )}>
                  {item.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
          {sel ? (
            <>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono",
                  TYPE_STYLES[sel.type]
                )}>
                  {sel.type}
                </span>
                <span className="text-xs text-zinc-600">
                  · copiado {relativeTime(sel.timestamp)}
                </span>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(sel.id)}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={13} />
                </Button>
              </div>

              <div className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 font-mono text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed overflow-y-auto break-all bg-zinc-50 dark:bg-zinc-900/80">
                {sel.content}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs h-8 px-4 gap-2 rounded-md"
                  onClick={() => copy(sel.content)}
                >
                  <Copy size={12} />
                  {copied ? "Copiado ✓" : "Copiar"}
                </Button>
                <Button
                  className="text-xs h-8 px-4 font-bold gap-2 rounded-md"
                  style={{ background: "var(--accent-color)", color: "#000", border: "none" }}
                  onClick={() => pasteNow(sel.content)}
                >
                  Colar agora ↵
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              Selecione um item
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
