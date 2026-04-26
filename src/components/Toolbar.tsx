import { ReactNode } from "react";
import { cn } from "@/common/utils";
import { Glass } from "./Glass";

interface ToolbarProps {
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export function Toolbar({ title, actions, className }: ToolbarProps) {
  return (
    <header className={cn("flex items-center gap-2 p-2 shrink-0", className)}>
      {title && (
        <span className="pl-2 text-[15px] font-bold text-black/85 dark:text-white/85 whitespace-nowrap">
          {title}
        </span>
      )}
      <div className="flex-1" />
      {actions}
      <Glass>
        <div className="w-[140px] h-9 flex items-center gap-1.5 px-3">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="#727272" strokeWidth="1.5" />
            <path d="M8.5 8.5l3 3" stroke="#727272" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] font-medium text-[#727272]">Search</span>
        </div>
      </Glass>
    </header>
  );
}
