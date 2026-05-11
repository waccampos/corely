export function captureCombo(e: React.KeyboardEvent): string[] | null {
  const mods: string[] = [];
  if (e.ctrlKey) mods.push("⌃");
  if (e.altKey) mods.push("⌥");
  if (e.shiftKey) mods.push("⇧");
  if (e.metaKey) mods.push("⌘");
  if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return null;
  const k = KEY_DISPLAY[e.key] ?? (e.key.length === 1 ? e.key.toUpperCase() : e.key);
  return [...mods, k];
}


