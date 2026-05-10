mod core;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
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
            core::clipboard::get_clipboard_history,
            core::clipboard::delete_clipboard_item,
            core::clipboard::clear_clipboard_history,
            core::clipboard::write_clipboard,
        ])
        .setup(|app| {
            core::tray::init(app)?;
            core::window::init(app)?;
            core::shortcuts::init(app)?;
            core::clipboard::start_monitor(app.handle().clone());
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(|event| {
                    if let tauri::WindowEvent::Focused(focused) = event {
                        core::clipboard::set_paused(*focused);
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
