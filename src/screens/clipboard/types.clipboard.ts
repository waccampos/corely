export type ItemType = "code" | "url" | "text";

export interface ClipItem {
  id: number;
  type: ItemType;
  content: string;
  timestamp: number;
}

export const TYPE_STYLES: Record<ItemType, string> = {
  code: "text-[var(--accent-color)] bg-[var(--accent-dim)]",
  url:  "text-blue-400 bg-blue-400/10",
  text: "text-zinc-400 bg-zinc-700/50",
};


