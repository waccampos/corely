import { useState, useEffect, useRef } from "react";
import { EXTENSIONS_DATA } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus } from "@/icons";
import { cn } from "@/common/utils";

type Filter = "todos" | "ativos" | "inativos";

export function ExtensionsScreen() {
  const [exts, setExts] = useState(EXTENSIONS_DATA);
  const [filter, setFilter] = useState<Filter>("todos");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  const displayed =
    filter === "todos"
      ? exts
      : filter === "ativos"
      ? exts.filter((e) => e.enabled)
      : exts.filter((e) => !e.enabled);

  const toggle = (id: number) =>
    setExts((prev) =>
      prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x))
    );

  useEffect(() => { setSelectedIdx(0); }, [filter]);

  useEffect(() => {
    setSelectedIdx(prev => Math.min(prev, Math.max(0, displayed.length - 1)));
  }, [displayed.length]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  useEffect(() => {
    const COLS = 2;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx(prev => Math.min(prev + COLS, displayed.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx(prev => Math.max(prev - COLS, 0));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIdx(prev => Math.min(prev + 1, displayed.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIdx(prev => Math.max(prev - 1, 0));
      } else if ((e.key === "Enter" || e.key === " ") && displayed[selectedIdx]) {
        e.preventDefault();
        toggle(displayed[selectedIdx].id);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed, selectedIdx]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex-1">
          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Extensões</div>
          <div className="text-[10px] text-zinc-600">
            {exts.filter((e) => e.enabled).length} ativas · {exts.length} total
          </div>
        </div>
        <div className="flex gap-1">
          {(["todos", "ativos", "inativos"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-7 px-3 rounded-md text-[11px] transition-colors cursor-pointer",
                filter === f
                  ? "bg-[var(--accent-dim)] text-[var(--accent-color)] font-medium"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer"
          style={{ background: "var(--accent-color)", color: "#000" }}
        >
          <Plus size={12} /> Instalar
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
        {displayed.map((ext, idx) => (
          <div
            key={ext.id}
            ref={idx === selectedIdx ? selectedRef : null}
            onClick={() => setSelectedIdx(idx)}
            className={cn(
              "rounded-xl p-3.5 flex flex-col gap-3 transition-all duration-75 cursor-pointer border",
              idx === selectedIdx
                ? "bg-[var(--accent-dim)] border-[var(--accent-color)]"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
              !ext.enabled && "opacity-50"
            )}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: ext.color + "20" }}
              >
                {ext.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                    {ext.name}
                  </span>
                  {ext.official && <Badge variant="accent">Oficial</Badge>}
                </div>
                <div className="text-[10.5px] text-zinc-500 leading-snug">
                  {ext.desc}
                </div>
              </div>
              <Switch checked={ext.enabled} onChange={() => toggle(ext.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
