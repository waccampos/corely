use gio::prelude::*;
use serde::Serialize;
use std::collections::HashSet;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum LauncherItem {
    App(App),
    System(SystemCommand),
    File(FileEntry),
}

impl LauncherItem {
    fn name(&self) -> &str {
        match self {
            LauncherItem::App(a) => &a.name,
            LauncherItem::System(c) => &c.name,
            LauncherItem::File(f) => &f.name,
        }
    }
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct App {
    pub id: String,
    pub name: String,
    pub exec: String,
    pub icon: Option<String>,
    pub description: Option<String>,
}

impl App {
    fn new(
        id: String,
        name: String,
        exec: String,
        icon: Option<String>,
        description: Option<String>,
    ) -> Self {
        Self {
            id,
            name,
            exec,
            icon,
            description,
        }
    }
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SystemCommand {
    pub id: String,
    pub name: String,
    pub exec: String,
    pub icon: Option<String>,
    pub description: Option<String>,
}

impl SystemCommand {
    fn new(id: String, name: String, exec: String) -> Self {
        Self {
            id,
            name,
            exec,
            icon: None,
            description: None,
        }
    }
}

pub trait Orchestrator {
    fn execute(&self);
}

impl Orchestrator for App {
    fn execute(&self) {
        if let Some(desktop) = gio::DesktopAppInfo::new(&self.id) {
            let _ = desktop.launch(&[], gio::AppLaunchContext::NONE);
            return;
        }
        spawn_exec(&self.exec);
    }
}

impl Orchestrator for SystemCommand {
    fn execute(&self) {
        spawn_exec(&self.exec);
    }
}

fn spawn_exec(exec: &str) {
    let parts: Vec<&str> = exec.split_whitespace().collect();
    if let Some((cmd, args)) = parts.split_first() {
        let _ = std::process::Command::new(cmd).args(args).spawn();
    }
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub id: String,
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

impl Orchestrator for FileEntry {
    fn execute(&self) {
        let _ = std::process::Command::new("xdg-open").arg(&self.path).spawn();
    }
}

const SKIP_DIRS: &[&str] = &[
    "node_modules", "target", ".git", ".cache", ".cargo",
    "vendor", "__pycache__", ".npm", ".rustup",
];

fn walk_search(dir: &Path, query: &str, depth: usize, results: &mut Vec<LauncherItem>) {
    if depth == 0 || results.len() >= 15 {
        return;
    }
    let Ok(entries) = fs::read_dir(dir) else { return };
    for entry in entries.flatten() {
        if results.len() >= 15 {
            break;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let path = entry.path();
        let is_dir = path.is_dir();
        if is_dir && SKIP_DIRS.contains(&name.as_str()) {
            continue;
        }
        if name.to_lowercase().contains(query) {
            let path_str = path.to_string_lossy().to_string();
            results.push(LauncherItem::File(FileEntry {
                id: path_str.clone(),
                name,
                path: path_str,
                is_dir,
            }));
        }
        if is_dir {
            walk_search(&path, query, depth - 1, results);
        }
    }
}

#[tauri::command]
pub fn search_files(query: String) -> Vec<LauncherItem> {
    let q = query.trim().to_lowercase();
    if q.len() < 2 {
        return vec![];
    }
    let home = std::env::var("HOME").unwrap_or_default();
    let mut results = Vec::new();
    walk_search(Path::new(&home), &q, 4, &mut results);
    results
}

fn get_system_commands() -> Vec<LauncherItem> {
    vec![
        ("system.shutdown", "Desligar", "systemctl poweroff"),
        ("system.reboot", "Reiniciar", "systemctl reboot"),
        ("system.suspend", "Suspender", "systemctl suspend"),
        (
            "system.volume.0",
            "Mutar volume",
            "pactl set-sink-volume @DEFAULT_SINK@ 0%",
        ),
        (
            "system.volume.10",
            "Mudar volume para 10",
            "pactl set-sink-volume @DEFAULT_SINK@ 10%",
        ),
        (
            "system.volume.20",
            "Mudar volume para 20",
            "pactl set-sink-volume @DEFAULT_SINK@ 20%",
        ),
        (
            "system.volume.30",
            "Mudar volume para 30",
            "pactl set-sink-volume @DEFAULT_SINK@ 30%",
        ),
        (
            "system.volume.40",
            "Mudar volume para 40",
            "pactl set-sink-volume @DEFAULT_SINK@ 40%",
        ),
        (
            "system.volume.50",
            "Mudar volume para 50",
            "pactl set-sink-volume @DEFAULT_SINK@ 50%",
        ),
        (
            "system.volume.60",
            "Mudar volume para 60",
            "pactl set-sink-volume @DEFAULT_SINK@ 60%",
        ),
        (
            "system.volume.70",
            "Mudar volume para 70",
            "pactl set-sink-volume @DEFAULT_SINK@ 70%",
        ),
        (
            "system.volume.80",
            "Mudar volume para 80",
            "pactl set-sink-volume @DEFAULT_SINK@ 80%",
        ),
        (
            "system.volume.90",
            "Mudar volume para 90",
            "pactl set-sink-volume @DEFAULT_SINK@ 90%",
        ),
        (
            "system.volume.100",
            "Mudar volume para 100",
            "pactl set-sink-volume @DEFAULT_SINK@ 100%",
        ),
    ]
    .into_iter()
    .map(|(id, name, exec)| {
        LauncherItem::System(SystemCommand::new(id.into(), name.into(), exec.into()))
    })
    .collect()
}

pub fn get_apps() -> Vec<LauncherItem> {
    let mut seen: HashSet<String> = HashSet::new();

    let items: Vec<LauncherItem> = gio::AppInfo::all()
        .into_iter()
        .filter(|info| info.should_show())
        .filter_map(|info| {
            let name = info.name().to_string();
            if !seen.insert(name.to_lowercase()) {
                return None;
            }

            let id = info
                .id()
                .map(|s| s.to_string())
                .unwrap_or_else(|| name.to_lowercase().replace(' ', "-"));

            let exec = info.executable().to_string_lossy().to_string();
            let icon = info.icon().as_ref().and_then(resolve_icon_from_gio);

            Some(LauncherItem::App(App::new(id, name, exec, icon, None)))
        })
        .collect();

    items
}

#[tauri::command]
pub fn get_items() -> Vec<LauncherItem> {
    let mut items: Vec<LauncherItem> = get_apps().into_iter().collect();
    items.sort_by(|a, b| a.name().to_lowercase().cmp(&b.name().to_lowercase()));

    items.extend(get_system_commands());

    items
}

#[tauri::command]
pub fn launch_app(id: String, exec: String) {
    if id.starts_with("system.") {
        SystemCommand {
            id,
            name: String::new(),
            exec,
            icon: None,
            description: None,
        }
        .execute();
    } else {
        App {
            id,
            name: String::new(),
            exec,
            icon: None,
            description: None,
        }
        .execute();
    }
}

fn resolve_icon_from_gio(icon: &gio::Icon) -> Option<String> {
    if let Ok(themed) = icon.clone().downcast::<gio::ThemedIcon>() {
        return themed
            .names()
            .iter()
            .find_map(|n| resolve_icon(n.as_str()))
            .and_then(icon_to_data_url);
    }
    if let Ok(file_icon) = icon.clone().downcast::<gio::FileIcon>() {
        let path = file_icon.file().path()?;
        return icon_to_data_url(path.to_string_lossy().to_string());
    }
    None
}

fn resolve_icon(icon: &str) -> Option<String> {
    if icon.starts_with('/') {
        return Path::new(icon).exists().then(|| icon.to_string());
    }

    let image_exts = ["png", "svg", "xpm", "jpg"];
    let last_ext = Path::new(icon)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");
    let stem: &str = if image_exts.contains(&last_ext) {
        Path::new(icon)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or(icon)
    } else {
        icon
    };

    let home = std::env::var("HOME").unwrap_or_default();
    let icon_bases: Vec<String> = vec![
        format!("{home}/.local/share/icons"),
        "/usr/share/icons".into(),
        format!("{home}/.local/share/flatpak/exports/share/icons"),
        "/var/lib/flatpak/exports/share/icons".into(),
    ];

    let themes = ["hicolor", "Adwaita", "gnome", "breeze", "Papirus"];
    let sizes = [
        "scalable", "512x512", "256x256", "128x128", "64x64", "48x48", "32x32",
    ];
    let subdirs = ["apps", "categories", "devices", "legacy"];
    let exts = ["svg", "png", "xpm"];

    for base in &icon_bases {
        if base.is_empty() {
            continue;
        }
        for theme in &themes {
            for size in &sizes {
                for subdir in &subdirs {
                    for ext in &exts {
                        let p = format!("{base}/{theme}/{size}/{subdir}/{stem}.{ext}");
                        if Path::new(&p).exists() {
                            return Some(p);
                        }
                    }
                }
            }
        }
    }

    for ext in &exts {
        let p = format!("/usr/share/pixmaps/{stem}.{ext}");
        if Path::new(&p).exists() {
            return Some(p);
        }
    }
    let p = format!("/usr/share/pixmaps/{icon}");
    if Path::new(&p).exists() {
        return Some(p);
    }

    None
}

fn icon_to_data_url(path: String) -> Option<String> {
    let bytes = fs::read(&path).ok()?;
    let mime = if path.ends_with(".svg") {
        "image/svg+xml"
    } else if path.ends_with(".png") {
        "image/png"
    } else {
        "image/x-xpixmap"
    };
    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Some(format!("data:{mime};base64,{b64}"))
}
