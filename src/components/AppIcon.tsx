import { useState } from "react";
import { LauncherItem } from "@/hooks/useApps";

interface AppIconProps {
  app: LauncherItem;
  size?: number;
}

export function AppIcon({ app, size = 32 }: AppIconProps) {
  const [failed, setFailed] = useState(false);

  const fontSize = Math.round(size * 0.46);
  const initial = app.name.charAt(0).toUpperCase();
  const icon = "icon" in app ? app.icon : null;

  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800"
      style={{ width: size, height: size }}
    >
      {icon && !failed ? (
        <img
          src={icon!}
          width={size}
          height={size}
          alt={app.name}
          onError={() => setFailed(true)}
          className="object-contain w-full h-full"
        />
      ) : (
        <span
          className="font-semibold text-zinc-600 dark:text-zinc-400 select-none"
          style={{ fontSize }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
