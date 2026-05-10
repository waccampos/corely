export interface AppItem {
  id: number;
  emoji: string;
  iconSlug?: string;
  color: string;
  name: string;
  sub: string;
  cat: string;
  shortcut?: string;
}

export interface Extension {
  id: number;
  emoji: string;
  color: string;
  name: string;
  desc: string;
  enabled: boolean;
  official: boolean;
  screen?: string;
}

export interface AccentPreset {
  label: string;
  dark: string;
  light: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { label: "Verde neon", dark: "#00e676", light: "#16a34a" },
  { label: "Azul",       dark: "#3b82f6", light: "#2563eb" },
  { label: "Roxo",       dark: "#a855f7", light: "#9333ea" },
  { label: "Laranja",    dark: "#f97316", light: "#ea580c" },
  { label: "Rosa",       dark: "#ec4899", light: "#db2777" },
  { label: "Âmbar",      dark: "#eab308", light: "#ca8a04" },
];

export interface Shortcut {
  action: string;
  keys: string[];
}

export const EXTENSIONS_DATA: Extension[] = [
  { id: 1, emoji: "📋", color: "#9b59b6", name: "Clipboard History",  desc: "Acesse itens recentes do clipboard",          enabled: true,  official: true,  screen: "clipboard" },
  { id: 2, emoji: "🎨", color: "#3b82f6", name: "Color Picker",        desc: "Capture cores de qualquer ponto da tela",     enabled: true,  official: true,  screen: "colorpicker"   },
  { id: 3, emoji: "🔑", color: "#e67e22", name: "Password Generator",  desc: "Gere senhas fortes com um atalho",            enabled: true,  official: true,  screen: "password"      },
  { id: 4, emoji: "🔢", color: "#10b981", name: "JSON Formatter",       desc: "Formate e valide JSON instantaneamente",      enabled: true,  official: true,  screen: "jsonformatter" }
//  { id: 5, emoji: "⚡", color: "#f59e0b", name: "Git Commands",         desc: "Atalhos para os comandos Git mais usados",    enabled: true,  official: true  },
//  { id: 6, emoji: "🐳", color: "#0ea5e9", name: "Docker Manager",       desc: "Gerencie containers sem abrir o terminal",    enabled: false, official: false },
//  { id: 7, emoji: "🌦️", color: "#60a5fa", name: "Weather",             desc: "Previsão do tempo com localização automática",enabled: true,  official: false },
//  { id: 8, emoji: "📦", color: "#ef4444", name: "NPM Scripts",          desc: "Execute scripts do package.json diretamente", enabled: false, official: false },
];
