import { useState, useCallback } from "react";

import { useCopy } from "@/hooks/useCopy";
import { Copy, Check, RotateCcw, Eye, EyeOff } from "@/icons";
import { cn } from "@/common/utils";

import { generate, getStrength } from "./lib.password";
import { PasswordOpts } from "./types.password";
import { Toggle } from "@/components/ui/toggle";

export function PasswordScreen() {
  const [opts, setOpts] = useState<PasswordOpts>({ upper: false, lower: true, nums: true, syms: false });
  const [length, setLength] = useState(10);

  const defaultOpts = { upper: true, lower: true, nums: true, syms: false };
  const [password, setPassword] = useState(() => generate(10, defaultOpts));
  const [show, setShow] = useState(false);

  const strength = getStrength(password);

  const { copyText, copied } = useCopy()

  const regenerate = useCallback(() => {
    setPassword(generate(length, opts));
  }, [length, opts]);

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
            <Toggle label="A–Z" value={opts.upper} onChange={() => setOpts(v => ({ ...v, upper: !v.upper }) )} />
            <Toggle label="a–z" value={opts.lower} onChange={() => setOpts(v => ({...v, lower: !v.lower}) )} />
            <Toggle label="0–9" value={opts.nums}  onChange={() => setOpts(v => ({ ...v, nums: !v.nums }) )} />
            <Toggle label="!@#" value={opts.syms}  onChange={() => setOpts(v => ({ ...v, syms: !v.syms }) )} />
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
          onClick={() => copyText(password)}
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
