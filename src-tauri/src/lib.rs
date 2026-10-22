use rdev::{listen, Event, EventType};
use serde::Serialize;
use std::panic;
use std::thread;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Serialize, Clone)]
struct InputPayload {
    event_type: String,
    code: String,
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle: AppHandle = app.handle().clone();

            thread::spawn(move || {
                // Catch any panic caused by macOS permission denial inside rdev
                let result = panic::catch_unwind(panic::AssertUnwindSafe(|| {
                    if let Err(error) = listen(move |event: Event| {
                        match event.event_type {
                            EventType::KeyPress(key) => {
                                let _ = handle.emit(
                                    "ghostkey-input",
                                    InputPayload {
                                        event_type: "keydown".into(),
                                        code: format!("{:?}", key),
                                    },
                                );
                            }
                            EventType::KeyRelease(key) => {
                                let _ = handle.emit(
                                    "ghostkey-input",
                                    InputPayload {
                                        event_type: "keyup".into(),
                                        code: format!("{:?}", key),
                                    },
                                );
                            }
                            EventType::ButtonPress(button) => {
                                let _ = handle.emit(
                                    "ghostkey-input",
                                    InputPayload {
                                        event_type: "mousedown".into(),
                                        code: format!("{:?}", button),
                                    },
                                );
                            }
                            EventType::ButtonRelease(button) => {
                                let _ = handle.emit(
                                    "ghostkey-input",
                                    InputPayload {
                                        event_type: "mouseup".into(),
                                        code: format!("{:?}", button),
                                    },
                                );
                            }
                            _ => {}
                        }
                    }) {
                        eprintln!("rdev listen error: {:?}", error);
                    }
                }));

                if result.is_err() {
                    eprintln!("GhostKey: Accessibility permission missing. Grant permission in System Settings -> Privacy & Security -> Accessibility.");
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}