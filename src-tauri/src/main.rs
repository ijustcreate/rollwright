mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::ai::start_local_ai,
            commands::ai::stop_local_ai,
            commands::ai::local_ai_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running Rollwright");
}

fn main() {
    run();
}
