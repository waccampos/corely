import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export function useCopy() {
    const [copied, setCopied] = useState<boolean>(false);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const copyText = useCallback(async (text: string) => {
        try{ await invoke("write_clipboard", { text }); } 
        catch { navigator.clipboard.writeText(text).catch(() => {}); }
        setCopied(true);
        setCopiedText(text);
        
        setTimeout(() => {
            setCopied(false);
            setCopiedText(null);
        }, 1500);
    }, []);
    return { copied, copiedText, copyText };
}

