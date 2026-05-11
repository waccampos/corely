import { useState, useCallback } from "react";

import { useCopy } from "@/hooks/useCopy";
import { Copy, Check, X, AlertTriangle } from "@/icons";
import { cn } from "@/common/utils";
import { isErr, isOk } from "@/lib/result";

import { parseJSON } from "./lib.jsonformatter";
import { IdentType } from "./types.jsonformatter";

export function JsonFormatterScreen() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [indent, setIndent] = useState(IdentType.Space);

  const { copied, copyText } = useCopy();

  const format = useCallback(() => {
    if (!input.trim()) return;
    const result = parseJSON(input);
    
    if (isErr(result)) {
        setError(result.error);
        return 
    }

    if (isOk(result)) { 
        setOutput(JSON.stringify(result.data, null, indent)); 
        setError(null); 
        return 
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    if (!input.trim()) return;
    const result = parseJSON(input);
    
    if (isErr(result)) {
        setError(result.error);
        return 
    }

    if (isOk(result)) { 
        setOutput(JSON.stringify(result.data)); 
        setError(null); 
        return 
    }

  }, [input]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    setTimeout(() => {
      const result = parseJSON(text);   

      if (isErr(result)) { 
          setError(result.error); 
          return 
      }
      
      if (isOk(result)) { 
          setOutput(JSON.stringify(result.data, null, indent)); 
          setError(null); 
          return 
      }
    }, 0);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Input panel */}
      <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-800 min-w-0">
        <div className="flex items-center justify-between px-4 h-10 border-b border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 font-mono">Entrada</span>
          {input && (
            <button
              onClick={() => { setInput(""); setOutput(""); setError(null); }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onPaste={handlePaste}
          placeholder="Cole ou digite seu JSON aqui..."
          spellCheck={false}
          className="flex-1 resize-none bg-transparent px-4 py-3 text-xs font-mono text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 outline-none leading-relaxed"
        />
      </div>

      {/* Output panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-3 h-10 border-b border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
          {/* Indent selector */}
          <div className="flex gap-1">
            {[IdentType.Space, IdentType.Tab].map(identType => (
              <button
                key={identType}
                onClick={() => setIndent(identType)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors",
                  indent === identType
                    ? "bg-[var(--accent-dim)] text-[var(--accent-color)]"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {identType}
              </button>
            ))}
          </div>

          <button
            onClick={format}
            className="h-6 px-2.5 rounded-md bg-[var(--accent-color)] text-black text-[10px] font-bold tracking-wide transition-opacity hover:opacity-80"
          >
            Formatar
          </button>
          <button
            onClick={minify}
            className="h-6 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-[10px] font-bold tracking-wide transition-colors hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
          >
            Minificar
          </button>

          <div className="flex-1" />

          {output && (
            <button
              onClick={() => copyText(output)}
              className={cn(
                "flex items-center gap-1 h-6 px-2 rounded-md text-[10px] font-medium transition-all",
                copied
                  ? "text-[var(--accent-color)] bg-[var(--accent-dim)]"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>

        {error ? (
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={14} />
              <span className="text-xs font-semibold">JSON inválido</span>
            </div>
            <div className="text-xs font-mono text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 leading-relaxed">
              {error}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {output ? (
              <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">{output}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                Saída formatada aparecerá aqui
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
