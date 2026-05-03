use arboard::Clipboard;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Mutex, OnceLock};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClipItem {
    pub id: u32,
    #[serde(rename = "type")]
    pub item_type: String, // "code" | "url" | "text"
    pub content: String,
    pub timestamp: u64,
}

static HISTORY: OnceLock<Mutex<Vec<ClipItem>>> = OnceLock::new();
static NEXT_ID: AtomicU32 = AtomicU32::new(1);
// Paused while Corely window is focused — avoids capturing WebKitGTK text selections
static PAUSED: AtomicBool = AtomicBool::new(false);

pub fn set_paused(paused: bool) {
    PAUSED.store(paused, Ordering::Relaxed);
}

fn history() -> &'static Mutex<Vec<ClipItem>> {
    HISTORY.get_or_init(|| Mutex::new(Vec::new()))
}

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn classify(s: &str) -> &'static str {
    let s = s.trim();
    if s.starts_with("http://") || s.starts_with("https://") || s.starts_with("ftp://") {
        return "url";
    }
    let code_hints = [
        "fn ", "let ", "const ", "var ", "function ", "class ", "import ", "from ",
        "def ", "sudo ", "apt ", "git ", "npm ", "cargo ", "docker ",
        "#!/", "=>", "->", "::", "//", "/*", ") {", "() {",
    ];
    if code_hints.iter().any(|h| s.contains(h)) {
        return "code";
    }
    "text"
}

fn make_id() -> u32 {
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
}

pub fn start_monitor(app: AppHandle) {
    thread::spawn(move || {
        let mut cb = match Clipboard::new() {
            Ok(c) => c,
            Err(_) => return,
        };
        let mut last = String::new();

        loop {
            thread::sleep(Duration::from_millis(500));

            if PAUSED.load(Ordering::Relaxed) {
                continue;
            }

            let text = match cb.get_text() {
                Ok(t) => t.trim().to_string(),
                Err(_) => continue,
            };

            if text.is_empty() || text == last {
                continue;
            }
            last = text.clone();

            let ts = now_secs();
            let item = ClipItem {
                id: make_id(),
                item_type: classify(&text).to_string(),
                content: text.clone(),
                timestamp: ts,
            };

            {
                let mut hist = history().lock().unwrap();
                // If already at top (e.g. from write_clipboard), skip
                if hist.first().map(|i| &i.content) == Some(&text) {
                    continue;
                }
                // Move to top if duplicate, otherwise prepend
                hist.retain(|i| i.content != text);
                hist.insert(0, item);
                if hist.len() > 50 {
                    hist.truncate(50);
                }
            }

            let _ = app.emit("clipboard-updated", ());
        }
    });
}

#[tauri::command]
pub fn get_clipboard_history() -> Vec<ClipItem> {
    history().lock().unwrap().clone()
}

#[tauri::command]
pub fn delete_clipboard_item(id: u32) {
    history().lock().unwrap().retain(|i| i.id != id);
}

#[tauri::command]
pub fn clear_clipboard_history() {
    history().lock().unwrap().clear();
}

#[tauri::command]
pub fn write_clipboard(text: String) -> Result<(), String> {
    Clipboard::new()
        .map_err(|e| e.to_string())?
        .set_text(text)
        .map_err(|e| e.to_string())
}
