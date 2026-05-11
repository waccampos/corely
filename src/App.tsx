import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppProvider, useApp, Screen } from "@/context/AppContext";
import { Titlebar } from "@/components/Titlebar";
import { LauncherScreen } from "@/screens/launcher";
import { ClipboardScreen } from "@/screens/clipboard";
import { ColorPickerScreen } from "@/screens/colorpicker";
import { PasswordScreen } from "@/screens/password";
import { JsonFormatterScreen } from "@/screens/jsonformatter";
import { SettingsScreen } from "@/screens/settings";

const SCREENS: Record<Screen, React.FC> = {
  launcher:      LauncherScreen,
  clipboard:     ClipboardScreen,
  colorpicker:   ColorPickerScreen,
  password:      PasswordScreen,
  jsonformatter: JsonFormatterScreen,
  settings:      SettingsScreen,
};

function AppShell() {
  const { theme, transparency, transparencyAmount, closeOnBlur, screen, setScreen } = useApp();

  useEffect(() => {
    const onFocus = () => setScreen("launcher");
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [setScreen]);

  useEffect(() => {
    if (screen === "launcher") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setScreen("launcher");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [screen, setScreen]);

  useEffect(() => {
    if (!closeOnBlur) return;
    const handler = () => invoke("hide_window");
    window.addEventListener("blur", handler);
    return () => window.removeEventListener("blur", handler);
  }, [closeOnBlur]);

  const isDark = theme === "dark";
  const alpha = (transparencyAmount / 100).toFixed(2);
  const winBg = transparency
    ? isDark ? `rgba(9,9,11,${alpha})` : `rgba(244,244,245,${alpha})`
    : isDark ? "#09090b" : "#fafafa";
  const winBorder = isDark ? "#27272a" : "#d4d4d8";

  const Screen = SCREENS[screen];

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div
        className="flex flex-col overflow-hidden rounded-[12px]"
        style={{
          width: 920,
          height: 580,
          background: winBg,
          backdropFilter: transparency ? "blur(32px) saturate(180%)" : "none",
          WebkitBackdropFilter: transparency ? "blur(32px) saturate(180%)" : "none",
          border: `1px solid ${winBorder}`,
        }}
      >
        <Titlebar />
        <div className="flex flex-1 overflow-hidden">
          <Screen />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
