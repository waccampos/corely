import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface AppEntry {
  type: "app";
  id: string;
  name: string;
  exec: string;
  icon: string | null;
  description: string | null;
}

export interface SystemEntry {
  type: "system";
  id: string;
  name: string;
  exec: string;
  icon: string | null;
  description: string | null;
}

export interface FileEntry {
  type: "file";
  id: string;
  name: string;
  path: string;
  isDir: boolean;
}

export interface ExtensionEntry {
  type: "extension";
  id: string;
  name: string;
  desc: string;
  emoji: string;
  color: string;
  screen?: string;
}

export interface ClipboardEntry {
  type: "clipboard";
  id: string;
  name: string;
  content: string;
}

export type LauncherItem = AppEntry | SystemEntry | FileEntry | ExtensionEntry | ClipboardEntry;

export function useApps() {
  const [apps, setApps] = useState<LauncherItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke<LauncherItem[]>("get_items")
      .then(setApps)
      .finally(() => setLoading(false));
  }, []);

  return { apps, loading };
}
