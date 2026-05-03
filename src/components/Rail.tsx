import { SVGProps, ReactElement } from "react";
import { useApp, Screen } from "@/context/AppContext";
import { Command, ClipboardIcon, Layers, SettingsIcon } from "@/icons";
import { cn } from "@/common/utils";

type IconComponent = (p: SVGProps<SVGSVGElement> & { size?: number }) => ReactElement;

const NAV: { id: Screen; Icon: IconComponent; label: string }[] = [
  { id: "launcher",   Icon: Command,       label: "Launcher" },
  { id: "clipboard",  Icon: ClipboardIcon, label: "Clipboard" },
  { id: "extensions", Icon: Layers,        label: "Extensões" },
];

export function Rail() {
  const { screen, setScreen, accent } = useApp();

  const navBtn = (id: Screen, Icon: IconComponent, label: string) => {
    const active = screen === id;
    return (
      <button
        key={id}
        onClick={() => setScreen(id)}
        title={label}
        className="w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-colors duration-100 cursor-pointer border-0"
        style={{ background: active ? "var(--accent-dim)" : "transparent" }}
      >
        <Icon
          size={15}
          style={active ? { color: accent } : undefined}
          className={cn(!active && "text-zinc-500")}
        />
      </button>
    );
  };

  return (
    <div className="w-12 flex flex-col items-center pt-2.5 gap-0.5 shrink-0 border-r bg-zinc-100 dark:bg-[#0c0c0e] border-zinc-200 dark:border-zinc-800">
      {NAV.map(({ id, Icon, label }) => navBtn(id, Icon, label))}
      <div className="flex-1" />
      <div className="w-px h-px mb-1 bg-zinc-200 dark:bg-zinc-800" />
      <button
        onClick={() => setScreen("settings")}
        title="Configurações"
        className="w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-colors duration-100 cursor-pointer border-0 mb-2"
        style={{ background: screen === "settings" ? "var(--accent-dim)" : "transparent" }}
      >
        <SettingsIcon
          size={15}
          style={screen === "settings" ? { color: accent } : undefined}
          className={cn(screen !== "settings" && "text-zinc-500")}
        />
      </button>
    </div>
  );
}
