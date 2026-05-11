use std::time::Duration;
use tauri::{App, AppHandle, Manager, Result, Runtime, WebviewUrl, WebviewWindowBuilder};

pub fn init(app: &App) -> Result<()> {
    WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("Transparent Titlebar Window")
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .resizable(false)
        .closable(false)
        .skip_taskbar(true)
        .visible(false)
        .build()
        .expect("failed to build window");

    Ok(())
}

pub fn show<R: Runtime>(handle: &AppHandle<R>) {
    let inner = handle.clone();
    let result = handle.run_on_main_thread(move || {
        let Some(win) = inner.get_webview_window("main") else {
            eprintln!("[window] get_webview_window('main') returned None");
            return;
        };
        if let Err(e) = win.show() {
            eprintln!("[window] show() failed: {e}");
        }
        if let Err(e) = win.set_focus() {
            eprintln!("[window] set_focus() failed: {e}");
        }
    });

    if let Err(e) = result {
        eprintln!("[window] run_on_main_thread() failed: {e}");
    }

    // On X11, WMs apply focus-stealing prevention to _NET_ACTIVE_WINDOW with
    // source=1 (application). We retry after 80 ms — giving the WM time to map
    // the window — using source=2 (pager), which most WMs honour unconditionally.
    // On Wayland, connect() returns Err and the function is a no-op.
    #[cfg(target_os = "linux")]
    {
        let handle2 = handle.clone();
        std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(80));
            let handle3 = handle2.clone();
            let _ = handle2.run_on_main_thread(move || {
                let visible = handle3
                    .get_webview_window("main")
                    .and_then(|w| w.is_visible().ok())
                    .unwrap_or(false);
                if visible {
                    force_focus_x11();
                }
            });
        });
    }
}

#[cfg(target_os = "linux")]
fn force_focus_x11() {
    let _ = focus_x11_inner();
}

#[cfg(target_os = "linux")]
fn focus_x11_inner() -> Option<()> {
    use x11rb::connection::Connection;
    use x11rb::protocol::xproto::*;
    use x11rb::rust_connection::RustConnection;

    let our_pid = std::process::id() as u32;
    let (conn, screen_num) = RustConnection::connect(None).ok()?;
    let root = conn.setup().roots[screen_num].root;

    let net_wm_pid = conn
        .intern_atom(false, b"_NET_WM_PID")
        .ok()?
        .reply()
        .ok()?
        .atom;
    let net_active_window = conn
        .intern_atom(false, b"_NET_ACTIVE_WINDOW")
        .ok()?
        .reply()
        .ok()?
        .atom;
    let net_client_list = conn
        .intern_atom(false, b"_NET_CLIENT_LIST")
        .ok()?
        .reply()
        .ok()?
        .atom;

    let clients = conn
        .get_property(false, root, net_client_list, AtomEnum::WINDOW, 0, 4096)
        .ok()?
        .reply()
        .ok()?;

    for xid in clients.value32()? {
        let Ok(cookie) = conn.get_property(false, xid, net_wm_pid, AtomEnum::CARDINAL, 0, 1) else {
            continue;
        };
        let Ok(prop) = cookie.reply() else { continue };
        let Some(pid) = prop.value32().and_then(|mut it| it.next()) else {
            continue;
        };

        if pid != our_pid {
            continue;
        }

        let event = ClientMessageEvent {
            response_type: CLIENT_MESSAGE_EVENT,
            format: 32,
            sequence: 0,
            window: xid,
            type_: net_active_window,
            data: ClientMessageData::from([2u32, 0, 0, 0, 0]),
        };
        let _ = conn.send_event(
            false,
            root,
            EventMask::SUBSTRUCTURE_REDIRECT | EventMask::SUBSTRUCTURE_NOTIFY,
            event,
        );
        let _ = conn.flush();
        return Some(());
    }

    None
}
