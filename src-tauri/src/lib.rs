use device_query::{DeviceQuery, DeviceState};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle: AppHandle = app.handle().clone();

            thread::spawn(move || {
                let device_state = DeviceState::new();
                let mut last_state = String::new();

                loop {
                    let keys = device_state.get_keys();
                    let mouse = device_state.get_mouse();
                    let mut active = Vec::new();
                    
                    // Convert pressed keys to strings
                    for k in keys {
                        active.push(format!("{:?}", k));
                    }
                    
                    // Add mouse clicks (Index 1 is Left Click, Index 2 is Right Click)
                    if mouse.button_pressed.get(1).copied().unwrap_or(false) {
                        active.push("LMB".to_string());
                    }
                    if mouse.button_pressed.get(2).copied().unwrap_or(false) {
                        active.push("RMB".to_string());
                    }

                    // Only emit to React if the held keys changed
                    let current_state = active.join(",");
                    if current_state != last_state {
                        let _ = handle.emit("ghostkey-state", &active);
                        last_state = current_state;
                    }

                    // Poll at 100hz (very fast, practically zero CPU usage)
                    thread::sleep(Duration::from_millis(10));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}