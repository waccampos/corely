import { Kbd } from "@/components/ui/kbd";
import { useState, useEffect, useRef } from "react";
import { captureCombo } from "../lib.settings";

export function ShortcutRow({
  action,
  keys,
  onSave,
}: {
  action: string;
  keys: string[];
  onSave: (keys: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Escape") { setEditing(false); setPreview([]); return; }
    const combo = captureCombo(e);
    if (!combo) return;
    setPreview(combo);
    onSave(combo);
    setEditing(false);
  };

  return (
    <div className="flex items-center py-3 border-b border-zinc-200/60 dark:border-zinc-800/60 group">
      <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{action}</span>
      {editing ? (
        <div
          ref={ref}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onBlur={() => { setEditing(false); setPreview([]); }}
          className="flex gap-1 items-center px-2 py-1 rounded-md border border-[var(--accent-border)] bg-[var(--accent-dim)] min-w-[80px] outline-none cursor-text"
        >
          {preview.length > 0
            ? preview.map((k, i) => <Kbd key={i}>{k}</Kbd>)
            : <span className="text-[10px] text-zinc-500 whitespace-nowrap">Pressione...</span>}
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          title="Clique para editar"
          className="flex gap-1 hover:opacity-60 transition-opacity"
        >
          {keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}
        </button>
      )}
    </div>
  );
}


