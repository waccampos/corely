mod core;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            core::orchestrator::get_items,
            core::orchestrator::launch_app,
            core::orchestrator::search_files,
            core::commands::hide_window,
            core::shortcuts::get_shortcuts,
            core::shortcuts::save_shortcut,
            core::shortcuts::reset_shortcuts,
        ])
        .setup(|app| {
            core::tray::init(app)?;
            core::window::init(app)?;
            core::shortcuts::init(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
