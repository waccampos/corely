import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Shortcut } from "@/data";

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke<Shortcut[]>("get_shortcuts").then(setShortcuts).finally(() => setLoading(false));
  }, []);

  const updateShortcut = async (index: number, keys: string[]) => {
    await invoke("save_shortcut", { index, keys });
    setShortcuts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, keys } : s))
    );
  };

  const resetShortcuts = async () => {
    const defs = await invoke<Shortcut[]>("reset_shortcuts");
    setShortcuts(defs);
  };

  return { shortcuts, updateShortcut, resetShortcuts, loading };
}
