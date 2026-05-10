import { createContext, useContext, useEffect, useRef, useState } from "react";
import { EXTENSIONS_DATA, Extension } from "@/data";
import { check } from "@tauri-apps/plugin-updater";

export type Screen = "launcher" | "clipboard" | "colorpicker" | "password" | "jsonformatter" | "settings";
export type Theme = "dark" | "light";

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: string;
  setAccent: (c: string) => void;
  compact: boolean;
  setCompact: (v: boolean) => void;
  showIcons: boolean;
  setShowIcons: (v: boolean) => void;
  transparency: boolean;
  setTransparency: (v: boolean) => void;
  transparencyAmount: number;
  setTransparencyAmount: (v: number) => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
  exts: Extension[];
  toggleExt: (id: number) => void;
  updateAvailable: boolean;
  installUpdate: () => Promise<void>;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export const useApp = () => useContext(AppContext);

function persist<T>(key: string, setter: (v: T) => void) {
  return (v: T) => {
    localStorage.setItem(key, String(v));
    setter(v);
  };
}

const VALID_SCREENS: Screen[] = ["launcher", "clipboard", "colorpicker", "password", "jsonformatter", "settings"];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("corely-theme") as Theme) || "dark"
  );
  const [accent, setAccentState] = useState(
    () => localStorage.getItem("corely-accent") || "#00e676"
  );
  const [compact, setCompactState] = useState(
    () => localStorage.getItem("corely-compact") === "true"
  );
  const [showIcons, setShowIconsState] = useState(
    () => localStorage.getItem("corely-icons") !== "false"
  );
  const [transparency, setTransparencyState] = useState(
    () => localStorage.getItem("corely-transparency") !== "false"
  );
  const [transparencyAmount, setTransparencyAmountState] = useState(
    () => Number(localStorage.getItem("corely-transparency-amount") || 75)
  );
  const [screen, setScreenState] = useState<Screen>(() => {
    const saved = localStorage.getItem("corely-screen") as Screen;
    return VALID_SCREENS.includes(saved) ? saved : "launcher";
  });
  const [exts, setExtsState] = useState<Extension[]>(() => {
    try {
      const saved = localStorage.getItem("corely-exts");
      if (saved) {
        const map: Record<number, boolean> = JSON.parse(saved);
        return EXTENSIONS_DATA.map((e) => ({ ...e, enabled: map[e.id] ?? e.enabled }));
      }
    } catch {}
    return EXTENSIONS_DATA;
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const pendingUpdate = useRef<Awaited<ReturnType<typeof check>>>(null);

  const toggleExt = (id: number) => {
    setExtsState((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e));
      const map = Object.fromEntries(next.map((e) => [e.id, e.enabled]));
      localStorage.setItem("corely-exts", JSON.stringify(map));
      return next;
    });
  };

  const installUpdate = async () => {
    if (!pendingUpdate.current) return;
    await pendingUpdate.current.downloadAndInstall();
  };

  useEffect(() => {
    check()
      .then((update) => {
        if (update) {
          pendingUpdate.current = update;
          setUpdateAvailable(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const r = parseInt(accent.slice(1, 3), 16);
    const g = parseInt(accent.slice(3, 5), 16);
    const b = parseInt(accent.slice(5, 7), 16);
    const root = document.documentElement;
    root.style.setProperty("--accent-color", accent);
    root.style.setProperty("--accent-dim", `rgba(${r},${g},${b},0.08)`);
    root.style.setProperty("--accent-border", `rgba(${r},${g},${b},0.22)`);
  }, [accent]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme: persist("corely-theme", setThemeState),
        accent,
        setAccent: persist("corely-accent", setAccentState),
        compact,
        setCompact: persist("corely-compact", setCompactState),
        showIcons,
        setShowIcons: persist("corely-icons", setShowIconsState),
        transparency,
        setTransparency: persist("corely-transparency", setTransparencyState),
        transparencyAmount,
        setTransparencyAmount: persist("corely-transparency-amount", setTransparencyAmountState),
        screen,
        setScreen: persist("corely-screen", setScreenState),
        exts,
        toggleExt,
        updateAvailable,
        installUpdate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
