import { useApp } from "@/context/AppContext";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";

export function AboutSection() {
  const { accent, updateAvailable, installUpdate } = useApp();
  const [version, setVersion] = useState("");
  const [updating, setUpdating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVersion().then(setVersion).catch(() => {});
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await installUpdate();
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-6 gap-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: accent + "15", border: `1.5px solid ${accent}40` }}
      >
        <Zap size={28} style={{ color: accent }} />
      </div>
      <div>
        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Corely</div>
        <div className="text-xs text-zinc-500 mt-1">
          {version ? `Versão ${version} — Linux x86_64` : "Carregando versão..."}
        </div>
      </div>
      <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
        Alternativa open-source ao Raycast para Linux. Leve, extensível e com personalização avançada.
      </p>
      <button
        onClick={() => window.open("https://github.com/waccampos/corely")}
        className="flex items-center gap-2 h-7 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs transition-colors"
      >
        <Github size={13} /> Ver no GitHub
      </button>
      {updateAvailable && !done && (
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="flex items-center gap-2 h-7 px-3 rounded-md bg-[var(--accent-color)] text-black text-xs font-medium transition-opacity disabled:opacity-60"
        >
          {updating ? "Baixando..." : "Atualizar agora"}
        </button>
      )}
      {done && (
        <p className="text-xs text-zinc-500">Reinicie o app para aplicar a atualização.</p>
      )}
      {error && (
        <p className="text-xs text-red-500">Erro ao baixar atualização. Tente novamente.</p>
      )}
      <div className="text-[10px] text-zinc-600 dark:text-zinc-500">Feito com ♥ pela comunidade Linux</div>
    </div>
  );
}


