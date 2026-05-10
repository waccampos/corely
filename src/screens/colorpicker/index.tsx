import { useState, useCallback } from "react";
import { Copy, Check } from "@/icons";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/common/utils";

function hexToRgb(hex: string) {
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const RECENT_KEY = "corely-recent-colors";

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

export function ColorPickerScreen() {
  const [color, setColor] = useState("#00e676");
  const [hexInput, setHexInput] = useState("#00E676");
  const [copied, setCopied] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(loadRecent);

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const formats = rgb && hsl
    ? [
        { label: "HEX", value: color.toUpperCase() },
        { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
        { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      ]
    : [];

  const copyValue = async (value: string) => {
    try { await invoke("write_clipboard", { text: value }); }
    catch { navigator.clipboard.writeText(value).catch(() => {}); }
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  const commitColor = useCallback((c: string) => {
    setRecent(prev => {
      const next = [c, ...prev.filter(x => x !== c)].slice(0, 12);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const applyColor = (c: string) => {
    setColor(c);
    setHexInput(c.toUpperCase());
    commitColor(c);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div className="w-60 border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-5 shrink-0">
        <label
          className="block w-full h-28 rounded-xl cursor-pointer relative overflow-hidden"
          style={{ background: color, boxShadow: `0 0 0 1px ${color}40` }}
        >
          <input
            type="color"
            value={color}
            onChange={e => { setColor(e.target.value); setHexInput(e.target.value.toUpperCase()); }}
            onBlur={e => commitColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <div className="absolute bottom-2 right-2 text-[10px] font-bold font-mono text-white/60 bg-black/30 px-1.5 py-0.5 rounded">
            Clique para abrir
          </div>
        </label>

        <input
          type="text"
          value={hexInput}
          onChange={e => {
            const v = e.target.value;
            setHexInput(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v.toLowerCase());
          }}
          onBlur={() => {
            if (/^#[0-9a-fA-F]{6}$/.test(hexInput)) commitColor(hexInput.toLowerCase());
            else setHexInput(color.toUpperCase());
          }}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-center uppercase text-zinc-800 dark:text-zinc-100 outline-none focus:border-[var(--accent-border)] tracking-widest"
        />

        {recent.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 font-mono mb-2">Recentes</div>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((c) => (
                <button
                  key={c}
                  title={c.toUpperCase()}
                  onClick={() => applyColor(c)}
                  className="w-6 h-6 rounded-md border border-black/10 dark:border-white/10 transition-transform hover:scale-110 shrink-0"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 font-mono">Formatos</div>

        {formats.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60"
          >
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 font-mono w-7 shrink-0">{label}</span>
            <span className="flex-1 text-sm font-mono text-zinc-800 dark:text-zinc-100 tracking-wide truncate">{value}</span>
            <button
              onClick={() => copyValue(value)}
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-md transition-colors shrink-0",
                copied === value
                  ? "text-[var(--accent-color)] bg-[var(--accent-dim)]"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
              )}
            >
              {copied === value ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        ))}

        {rgb && (
          <div className="mt-1 grid grid-cols-3 gap-2">
            {([ ["R", rgb.r, "#ef4444"], ["G", rgb.g, "#22c55e"], ["B", rgb.b, "#3b82f6"] ] as [string, number, string][]).map(([ch, val, col]) => (
              <div
                key={ch}
                className="flex flex-col items-center py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60"
              >
                <span className="text-[10px] font-bold font-mono" style={{ color: col }}>{ch}</span>
                <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-100 mt-1">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
