use tauri::Manager;

#[tauri::command]
pub fn hide_window(app: tauri::AppHandle) {
    let inner = app.clone();

    let _ = app.run_on_main_thread(move || {
        if let Some(window) = inner.get_webview_window("main") {
            let _ = window.hide();
        }
    });
}
