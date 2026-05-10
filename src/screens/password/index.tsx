import { useState, useCallback } from "react";
import { Copy, Check, RotateCcw, Eye, EyeOff } from "@/icons";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/common/utils";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMS  = "0123456789";
const SYMS  = "!@#$%^&*()-_=+[]{}|;:,.<>?";

function generate(len: number, opts: { upper: boolean; lower: boolean; nums: boolean; syms: boolean }): string {
  let pool = "";
  if (opts.upper) pool += UPPER;
  if (opts.lower) pool += LOWER;
  if (opts.nums)  pool += NUMS;
  if (opts.syms)  pool += SYMS;
  if (!pool) pool = LOWER;
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(n => pool[n % pool.length]).join("");
}

function getStrength(pw: string): { label: string; color: string; pct: number } {
  if (!pw) return { label: "", color: "", pct: 0 };
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 20) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Fraca",       color: "#ef4444", pct: 25  };
  if (score <= 4) return { label: "Média",        color: "#f59e0b", pct: 60  };
  if (score <= 5) return { label: "Forte",        color: "#22c55e", pct: 85  };
  return             { label: "Muito forte",  color: "#00e676", pct: 100 };
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
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

export function PasswordScreen() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(false);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState(() =>
    generate(16, { upper: true, lower: true, nums: true, syms: false })
  );

  const strength = getStrength(password);

  const regenerate = useCallback(() => {
    setPassword(generate(length, { upper, lower, nums, syms }));
    setCopied(false);
  }, [length, upper, lower, nums, syms]);

  const copy = async () => {
    try { await invoke("write_clipboard", { text: password }); }
    catch { navigator.clipboard.writeText(password).catch(() => {}); }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: controls */}
      <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-5 shrink-0">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 font-mono">Comprimento</span>
            <span className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-100">{length}</span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            className="w-full accent-[var(--accent-color)]"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
            <span>6</span><span>64</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 font-mono mb-2">Caracteres</div>
          <div className="grid grid-cols-2 gap-1.5">
            <Toggle label="A–Z" value={upper} onChange={() => setUpper(v => !v)} />
            <Toggle label="a–z" value={lower} onChange={() => setLower(v => !v)} />
            <Toggle label="0–9" value={nums}  onChange={() => setNums(v => !v)} />
            <Toggle label="!@#" value={syms}  onChange={() => setSyms(v => !v)} />
          </div>
        </div>

        <button
          onClick={regenerate}
          className="flex items-center justify-center gap-2 h-9 rounded-lg font-medium text-sm transition-opacity hover:opacity-85 bg-[var(--accent-color)] text-black"
        >
          <RotateCcw size={13} /> Gerar senha
        </button>
      </div>

      {/* Right: output */}
      <div className="flex-1 p-5 flex flex-col gap-4 min-w-0">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 font-mono">Senha gerada</div>

        <div className="flex items-start gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-4">
          <span
            className={cn(
              "flex-1 font-mono text-sm break-all text-zinc-800 dark:text-zinc-100 leading-relaxed transition-all",
              !show && "blur-[4px] select-none"
            )}
          >
            {password}
          </span>
          <button
            onClick={() => setShow(v => !v)}
            className="shrink-0 mt-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            title={show ? "Ocultar" : "Mostrar"}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 font-mono">Força</span>
            <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${strength.pct}%`, background: strength.color }}
            />
          </div>
        </div>

        <button
          onClick={copy}
          className={cn(
            "flex items-center justify-center gap-2 h-9 rounded-lg border text-sm font-medium transition-all",
            copied
              ? "border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent-color)]"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
          )}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado!" : "Copiar senha"}
        </button>
      </div>
    </div>
  );
}
