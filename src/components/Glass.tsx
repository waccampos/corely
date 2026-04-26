import { CSSProperties, ReactNode } from "react";
import { cn } from "@/common/utils";

interface GlassProps {
  children?: ReactNode;
  radius?: number;
  dark?: boolean;
  className?: string;
}

export function Glass({ children, radius = 296, dark = false, className }: GlassProps) {
  const overlayStyle: CSSProperties = {
    borderRadius: radius,
    background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.35)",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    border: dark
      ? "0.5px solid rgba(255,255,255,0.12)"
      : "0.5px solid rgba(255,255,255,0.6)",
    boxShadow: dark
      ? "0 8px 40px rgba(0,0,0,0.2)"
      : "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)",
  };

  return (
    <div className={cn("relative", className)} style={{ borderRadius: radius }}>
      <div className="absolute inset-0" style={overlayStyle} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
