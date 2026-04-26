import { CSSProperties, ReactNode } from "react";
import { cn } from "@/common/utils";
import { useApp } from "@/context/AppContext";

interface SidebarProps {
  children?: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const glassStyle: CSSProperties = isDark
    ? {
        borderRadius: 18,
        background: "rgba(20,22,28,0.65)",
        backdropFilter: "blur(50px) saturate(200%)",
        WebkitBackdropFilter: "blur(50px) saturate(200%)",
        border: "0.5px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      }
    : {
        borderRadius: 18,
        background: "rgba(210,225,245,0.45)",
        backdropFilter: "blur(50px) saturate(200%)",
        WebkitBackdropFilter: "blur(50px) saturate(200%)",
        border: "0.5px solid rgba(255,255,255,0.5)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.35)",
      };

  return (
    <aside className={cn("w-[220px] h-full p-2 shrink-0 relative flex flex-col", className)}>
      <div className="absolute inset-2" style={glassStyle} />
      <div className="relative z-10 py-[10px] flex flex-col gap-0.5">
        <div className="h-8 flex items-center px-[10px] mb-1" data-tauri-drag-region>
        </div>
        {children}
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ label, selected = false, onClick }: SidebarItemProps) {
  const { theme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      className="relative flex items-center gap-1.5 h-6 mx-[10px] px-[6px] pr-[10px] rounded-lg text-[11px] font-medium cursor-default"
      onClick={onClick}
    >
      {selected && (
        <div
          className="absolute inset-0 rounded-lg"
          style={
            isDark
              ? { background: "rgba(255,255,255,0.10)" }
              : { background: "rgba(0,0,0,0.11)", mixBlendMode: "multiply" }
          }
        />
      )}
      <div
        className="w-3.5 h-3.5 rounded-full shrink-0 relative"
        style={{
          background: selected
            ? "#007aff"
            : isDark
            ? "rgba(255,255,255,0.40)"
            : "rgba(0,0,0,0.40)",
          opacity: selected ? 1 : 0.5,
        }}
      />
      <span className="text-black/85 dark:text-white/85 relative">{label}</span>
    </div>
  );
}

interface SidebarHeaderProps {
  title: string;
}

export function SidebarHeader({ title }: SidebarHeaderProps) {
  return (
    <div className="px-[18px] pt-3.5 pb-[5px] text-[11px] font-bold text-black/50 dark:text-white/50 uppercase tracking-wide">
      {title}
    </div>
  );
}
