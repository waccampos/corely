use serde::{Deserialize, Serialize};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_store::StoreExt;

const STORE_FILE: &str = "shortcuts.json";
const STORE_KEY: &str = "shortcuts";

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ShortcutEntry {
    pub action: String,
    pub keys: Vec<String>,
}

pub fn defaults() -> Vec<ShortcutEntry> {
    vec![
        ShortcutEntry {
            action: "Abrir Corely".into(),
            keys: vec!["⌃".into(), "⌥".into(), "Espaço".into()],
        },
        ShortcutEntry {
            action: "Histórico do Clipboard".into(),
            keys: vec!["⌃".into(), "⇧".into(), "C".into()],
        },
        ShortcutEntry {
            action: "Busca de arquivos".into(),
            keys: vec!["⌃".into(), "⇧".into(), "F".into()],
        },
        ShortcutEntry {
            action: "Fechar launcher".into(),
            keys: vec!["Esc".into()],
        },
        ShortcutEntry {
            action: "Próximo resultado".into(),
            keys: vec!["↓".into()],
        },
        ShortcutEntry {
            action: "Resultado anterior".into(),
            keys: vec!["↑".into()],
        },
        ShortcutEntry {
            action: "Abrir selecionado".into(),
            keys: vec!["↵".into()],
        },
        ShortcutEntry {
            action: "Ver ações do item".into(),
            keys: vec!["⌃".into(), "K".into()],
        },
    ]
}

// Converts display-key tokens (⌃, ⇧, Espaço, ↵ …) into a Shortcut for the global plugin.
// Returns None if no non-modifier key is found — those shortcuts are in-app only.
pub fn keys_to_shortcut(keys: &[String]) -> Option<Shortcut> {
    let mut mods = Modifiers::empty();
    let mut code: Option<Code> = None;

    for key in keys {
        match key.as_str() {
            "⌃" => mods |= Modifiers::CONTROL,
            "⇧" => mods |= Modifiers::SHIFT,
            "⌥" => mods |= Modifiers::ALT,
            "⌘" => mods |= Modifiers::META,
            "Espaço" => code = Some(Code::Space),
            "Esc" => code = Some(Code::Escape),
            "↵" => code = Some(Code::Enter),
            "↑" => code = Some(Code::ArrowUp),
            "↓" => code = Some(Code::ArrowDown),
            "←" => code = Some(Code::ArrowLeft),
            "→" => code = Some(Code::ArrowRight),
            "⇥" => code = Some(Code::Tab),
            "⌫" => code = Some(Code::Backspace),
            k if k.len() == 1 => {
                code = k.chars().next().and_then(char_to_code);
            }
            _ => {}
        }
    }

    code.map(|c| Shortcut::new(if mods.is_empty() { None } else { Some(mods) }, c))
}

fn char_to_code(c: char) -> Option<Code> {
    match c.to_ascii_uppercase() {
        'A' => Some(Code::KeyA),
        'B' => Some(Code::KeyB),
        'C' => Some(Code::KeyC),
        'D' => Some(Code::KeyD),
        'E' => Some(Code::KeyE),
        'F' => Some(Code::KeyF),
        'G' => Some(Code::KeyG),
        'H' => Some(Code::KeyH),
        'I' => Some(Code::KeyI),
        'J' => Some(Code::KeyJ),
        'K' => Some(Code::KeyK),
        'L' => Some(Code::KeyL),
        'M' => Some(Code::KeyM),
        'N' => Some(Code::KeyN),
        'O' => Some(Code::KeyO),
        'P' => Some(Code::KeyP),
        'Q' => Some(Code::KeyQ),
        'R' => Some(Code::KeyR),
        'S' => Some(Code::KeyS),
        'T' => Some(Code::KeyT),
        'U' => Some(Code::KeyU),
        'V' => Some(Code::KeyV),
        'W' => Some(Code::KeyW),
        'X' => Some(Code::KeyX),
        'Y' => Some(Code::KeyY),
        'Z' => Some(Code::KeyZ),
        '0' => Some(Code::Digit0),
        '1' => Some(Code::Digit1),
        '2' => Some(Code::Digit2),
        '3' => Some(Code::Digit3),
        '4' => Some(Code::Digit4),
        '5' => Some(Code::Digit5),
        '6' => Some(Code::Digit6),
        '7' => Some(Code::Digit7),
        '8' => Some(Code::Digit8),
        '9' => Some(Code::Digit9),
        _ => None,
    }
}

fn read_shortcuts(app: &tauri::AppHandle) -> Vec<ShortcutEntry> {
    app.store(STORE_FILE)
        .ok()
        .and_then(|s| s.get(STORE_KEY))
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(defaults)
}

fn register_open_corely<R: tauri::Runtime>(
    handle: &impl GlobalShortcutExt<R>,
    keys: &[String],
) -> Result<(), tauri_plugin_global_shortcut::Error> {
    let shortcut = keys_to_shortcut(keys)
        .unwrap_or_else(|| Shortcut::new(Some(Modifiers::CONTROL), Code::Space));

    handle
        .global_shortcut()
        .on_shortcut(shortcut, |app, _, event| {
            if event.state() == ShortcutState::Pressed {
                eprintln!("[shortcut] fired → show_on_primary");
                crate::core::window::show(app);
            }
        })
}

// Called from lib.rs setup — reads the store and registers the saved global shortcut.
pub fn init(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let shortcuts: Vec<ShortcutEntry> = app
        .store(STORE_FILE)
        .ok()
        .and_then(|s| s.get(STORE_KEY))
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(defaults);

    if let Err(e) = register_open_corely(app, &shortcuts[0].keys) {
        eprintln!(
            "[shortcut] failed to register '{}': {e}",
            shortcuts[0].keys.join("+")
        );
        eprintln!("[shortcut] shortcut unavailable — change it in Settings");
    }
    Ok(())
}

#[tauri::command]
pub fn get_shortcuts(app: tauri::AppHandle) -> Vec<ShortcutEntry> {
    read_shortcuts(&app)
}

#[tauri::command]
pub fn save_shortcut(app: tauri::AppHandle, index: usize, keys: Vec<String>) -> Result<(), String> {
    let mut shortcuts = read_shortcuts(&app);

    if index >= shortcuts.len() {
        return Err(format!("index {index} fora do intervalo"));
    }

    if index == 0 {
        if let Some(new_sc) = keys_to_shortcut(&keys) {
            if let Some(old_sc) = keys_to_shortcut(&shortcuts[0].keys) {
                let _ = app.global_shortcut().unregister(old_sc);
            }
            app.global_shortcut()
                .on_shortcut(new_sc, |app, _, event| {
                    if event.state() == ShortcutState::Pressed {
                        crate::core::window::show(app);
                    }
                })
                .map_err(|e| e.to_string())?;
        }
    }

    shortcuts[index].keys = keys;

    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(
        STORE_KEY,
        serde_json::to_value(&shortcuts).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn reset_shortcuts(app: tauri::AppHandle) -> Result<Vec<ShortcutEntry>, String> {
    let defs = defaults();

    let _ = app.global_shortcut().unregister_all();
    register_open_corely(&app, &defs[0].keys).map_err(|e| e.to_string())?;

    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(
        STORE_KEY,
        serde_json::to_value(&defs).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;

    Ok(defs)
}
