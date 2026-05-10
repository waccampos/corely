import { ReactNode, useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ACCENT_PRESETS } from "@/data";
import { useShortcuts } from "@/hooks/useShortcuts";
import { Switch } from "@/components/ui/switch";
import { Kbd } from "@/components/ui/kbd";
import { Sun, Moon, Zap, Github, Check, SlidersHorizontal, Palette, Keyboard, Info, RotateCcw, Layers } from "@/icons";
import { cn } from "@/common/utils";

function SettingsRow({
  label,
  desc,
  val,
  onChange,
}: {
  label: string;
  desc?: string;
  val: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
      <div className="flex-1 pr-4">
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</div>
        {desc && (
          <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{desc}</div>
        )}
      </div>
      <Switch checked={val} onChange={onChange} />
    </div>
  );
}

const KEY_DISPLAY: Record<string, string> = {
  " ": "Espaço", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
  Enter: "↵", Escape: "Esc", Tab: "⇥", Backspace: "⌫", Delete: "⌦",
};

function captureCombo(e: React.KeyboardEvent): string[] | null {
  const mods: string[] = [];
  if (e.ctrlKey) mods.push("⌃");
  if (e.altKey) mods.push("⌥");
  if (e.shiftKey) mods.push("⇧");
  if (e.metaKey) mods.push("⌘");
  if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return null;
  const k = KEY_DISPLAY[e.key] ?? (e.key.length === 1 ? e.key.toUpperCase() : e.key);
  return [...mods, k];
}

function ShortcutRow({
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

type Section = "Geral" | "Aparência" | "Atalhos" | "Extensões" | "Sobre";

const NAV_ITEMS: { id: Section; icon: ReactNode }[] = [
  { id: "Geral",      icon: <SlidersHorizontal size={14} /> },
  { id: "Aparência",  icon: <Palette size={14} /> },
  { id: "Atalhos",    icon: <Keyboard size={14} /> },
  { id: "Extensões",  icon: <Layers size={14} /> },
  { id: "Sobre",      icon: <Info size={14} /> },
];

export function SettingsScreen() {
  const {
    theme, setTheme,
    accent, setAccent,
    compact, setCompact,
    showIcons, setShowIcons,
    transparency, setTransparency,
    exts, toggleExt,
  } = useApp();
  const { shortcuts, updateShortcut, resetShortcuts } = useShortcuts();

  const [section, setSection] = useState<Section>("Aparência");

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sub-nav */}
      <div className="w-44 border-r border-zinc-200 dark:border-zinc-800 p-2 shrink-0">
        {NAV_ITEMS.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={cn(
              "flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors duration-100 cursor-pointer",
              section === id
                ? "bg-[var(--accent-dim)] text-[var(--accent-color)] font-medium"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
            )}
          >
            {icon} {id}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {section === "Geral" && (
          <>
            <SettingsRow label="Iniciar com o sistema"      desc="Inicia o Corely automaticamente no login"         val={true}  onChange={() => {}} />
            <SettingsRow label="Executar em segundo plano"  desc="Mantém ativo na bandeja do sistema"                val={true}  onChange={() => {}} />
            <SettingsRow label="Mostrar no dock"            desc="Exibe ícone na barra de tarefas"                   val={false} onChange={() => {}} />
            <SettingsRow label="Animações de interface"     desc="Transições e micro-animações"                      val={true}  onChange={() => {}} />
            <SettingsRow label="Som ao abrir"               desc="Feedback sonoro ao ativar o launcher"              val={false} onChange={() => {}} />
          </>
        )}

        {section === "Aparência" && (
          <>
            {/* Tema */}
            <div className="mb-5">
              <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 font-mono mb-2.5">
                Tema
              </div>
              <div className="flex gap-2">
                {([
                  { id: "dark" as const,  label: "Escuro", icon: <Moon size={14} /> },
                  { id: "light" as const, label: "Claro",  icon: <Sun size={14} /> },
                ]).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer",
                      theme === th.id
                        ? "border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent-color)]"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    {th.icon} {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor de destaque */}
            <div className="mb-5">
              <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 font-mono mb-2.5">
                Cor de destaque
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                {ACCENT_PRESETS.map((p) => {
                  const color = theme === "dark" ? p.dark : p.light;
                  const isActive = accent === color;
                  return (
                    <button
                      key={p.dark}
                      onClick={() => setAccent(color)}
                      title={p.label}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-100 cursor-pointer"
                      style={{
                        background: color,
                        outline: isActive ? `2.5px solid ${color}` : "2.5px solid transparent",
                        outlineOffset: 3,
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {isActive && <Check size={12} color="#000" strokeWidth={3} />}
                    </button>
                  );
                })}
                <label
                  className="relative w-7 h-7 rounded-full cursor-pointer overflow-hidden"
                  title="Personalizada"
                  style={{ background: "conic-gradient(red,orange,yellow,green,cyan,blue,violet,red)" }}
                >
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Layout */}
            <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 font-mono mb-1">
              Layout
            </div>
            <SettingsRow label="Modo compacto"          desc="Remove subtítulos e reduz ícones no launcher" val={compact}      onChange={setCompact} />
            <SettingsRow label="Ícones nos resultados"  desc="Exibe ícones ao lado dos itens"               val={showIcons}    onChange={setShowIcons} />
            <SettingsRow label="Efeito de transparência" desc="Fundo desfocado (frosted glass)"             val={transparency} onChange={setTransparency} />
          </>
        )}

        {section === "Atalhos" && (
          <div>
            {shortcuts.map((item, i) => (
              <ShortcutRow
                key={i}
                action={item.action}
                keys={item.keys}
                onSave={(keys) => updateShortcut(i, keys)}
              />
            ))}
            <div className="pt-4">
              <button
                onClick={resetShortcuts}
                className="flex items-center gap-2 h-7 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-xs transition-colors"
              >
                <RotateCcw size={11} /> Restaurar padrões
              </button>
            </div>
          </div>
        )}

        {section === "Extensões" && (
          <div>
            {exts.map((ext) => (
              <div
                key={ext.id}
                className="flex items-center py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 mr-3"
                  style={{ background: ext.color + "20" }}
                >
                  {ext.emoji}
                </div>
                <div className="flex-1 pr-4 min-w-0">
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {ext.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 truncate">{ext.desc}</div>
                </div>
                <Switch checked={ext.enabled} onChange={() => toggleExt(ext.id)} />
              </div>
            ))}
          </div>
        )}

        {section === "Sobre" && (
          <div className="flex flex-col items-center pt-6 gap-4 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: accent + "15", border: `1.5px solid ${accent}40` }}
            >
              <Zap size={28} style={{ color: accent }} />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Corely</div>
              <div className="text-xs text-zinc-500 mt-1">Versão 1.0.0 — Linux x86_64</div>
            </div>
            <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
              Alternativa open-source ao Raycast para Linux. Leve, extensível e com personalização avançada.
            </p>
            <button onClick={() => window.open("https://github.com/waccampos/corely")} className="flex items-center gap-2 h-7 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs transition-colors">
              <Github size={13} /> Ver no GitHub
            </button>
            <div className="text-[10px] text-zinc-600 dark:text-zinc-500">Feito com ♥ pela comunidade Linux</div>
          </div>
        )}
      </div>
    </div>
  );
}
