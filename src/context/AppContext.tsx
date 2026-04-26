import { createContext, useContext, useEffect, useState } from "react";

export type Screen = "launcher" | "extensions" | "settings";
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
  screen: Screen;
  setScreen: (s: Screen) => void;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export const useApp = () => useContext(AppContext);

function persist<T>(key: string, setter: (v: T) => void) {
  return (v: T) => {
    localStorage.setItem(key, String(v));
    setter(v);
  };
}

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
  const VALID_SCREENS: Screen[] = ["launcher", "extensions", "settings"];
  const [screen, setScreenState] = useState<Screen>(() => {
    const saved = localStorage.getItem("corely-screen") as Screen;
    return VALID_SCREENS.includes(saved) ? saved : "launcher";
  });

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
        screen,
        setScreen: persist("corely-screen", setScreenState),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
