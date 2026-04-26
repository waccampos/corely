import { AppProvider, useApp, Screen } from "@/context/AppContext";
import { Titlebar } from "@/components/Titlebar";
import { Rail } from "@/components/Rail";
import { LauncherScreen } from "@/screens/launcher";
import { ExtensionsScreen } from "@/screens/extensions";
import { SettingsScreen } from "@/screens/settings";

const SCREENS: Record<Screen, React.FC> = {
  launcher:   LauncherScreen,
  extensions: ExtensionsScreen,
  settings:   SettingsScreen
};

function AppShell() {
  const { theme, transparency, screen } = useApp();

  const isDark = theme === "dark";
  const winBg = transparency
    ? isDark ? "rgba(9,9,11,0.75)" : "rgba(244,244,245,0.75)"
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
          boxShadow: isDark
            ? "0 40px 120px rgba(0,0,0,0.9), 0 8px 32px rgba(0,0,0,0.6)"
            : "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <Titlebar />
        <div className="flex flex-1 overflow-hidden">
          <Rail />
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
