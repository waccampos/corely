import { ReactNode, useState } from "react";

import { useApp } from "@/context/AppContext";
import { ACCENT_PRESETS } from "@/data";
import { useShortcuts } from "@/hooks/useShortcuts";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Check, SlidersHorizontal, Palette, Keyboard, Info, RotateCcw, Layers } from "@/icons";
import { cn } from "@/common/utils";

import { SettingsRow } from "./components/settings-row";
import { ShortcutRow } from "./components/shortcutRow";
import { AboutSection } from "./components/about-section";

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
    transparencyAmount, setTransparencyAmount,
    closeOnBlur, setCloseOnBlur,
    fileSearch, setFileSearch,
    maxResults, setMaxResults,
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
            <SettingsRow label="Executar em segundo plano"  desc="Mantém ativo na bandeja do sistema"              val={true}         onChange={() => {}} />
            <SettingsRow label="Fechar ao perder foco"      desc="Fecha o launcher ao clicar fora da janela"        val={closeOnBlur}  onChange={setCloseOnBlur} />
            <SettingsRow label="Busca de arquivos"          desc="Inclui arquivos e pastas nos resultados"           val={fileSearch}   onChange={setFileSearch} />
            <SettingsRow label="Animações de interface"     desc="Transições e micro-animações"                      val={true}         onChange={() => {}} />
            <SettingsRow label="Som ao abrir"               desc="Feedback sonoro ao ativar o launcher"              val={false}        onChange={() => {}} />
            <div className="flex items-center py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex-1 pr-4">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Máximo de resultados</div>
                <div className="text-xs text-zinc-500 mt-0.5 leading-snug">Itens exibidos por categoria</div>
              </div>
              <div className="flex items-center gap-3 w-44">
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="flex-1 accent-[var(--accent-color)]"
                />
                <span className="text-xs font-mono text-zinc-500 w-6 text-right">{maxResults}</span>
              </div>
            </div>
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
            {transparency && (
              <div className="flex items-center py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex-1 pr-4">
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Intensidade</div>
                  <div className="text-xs text-zinc-500 mt-0.5 leading-snug">Quantidade de transparência do fundo</div>
                </div>
                <div className="flex items-center gap-3 w-44">
                  <input
                    type="range"
                    min={15}
                    max={100}
                    value={transparencyAmount}
                    onChange={e => setTransparencyAmount(Number(e.target.value))}
                    className="flex-1 accent-[var(--accent-color)]"
                  />
                  <span className="text-xs font-mono text-zinc-500 w-8 text-right">{transparencyAmount}%</span>
                </div>
              </div>
            )}
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

        {section === "Sobre" && <AboutSection />}
      </div>
    </div>
  );
}
