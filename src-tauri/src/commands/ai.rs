use std::sync::Mutex;

use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

static AI_STATUS: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
pub async fn start_local_ai(app: AppHandle, model_path: String) -> Result<String, String> {
    let port = "8088";
    let endpoint = format!("http://127.0.0.1:{port}/v1");

    let sidecar = app
        .shell()
        .sidecar("llama-server")
        .map_err(|error| format!("Failed to create llama-server sidecar: {error}"))?;

    let (_rx, _child) = sidecar
        .args([
            "-m",
            &model_path,
            "--host",
            "127.0.0.1",
            "--port",
            port,
            "--ctx-size",
            "32768",
        ])
        .spawn()
        .map_err(|error| format!("Failed to start llama-server: {error}"))?;

    *AI_STATUS
        .lock()
        .map_err(|_| "Failed to lock AI status".to_string())? = Some(endpoint.clone());

    Ok(endpoint)
}

#[tauri::command]
pub async fn stop_local_ai(_app: AppHandle) -> Result<(), String> {
    // V2 scaffold note:
    // store the sidecar child handle in app state before wiring this for real.
    *AI_STATUS
        .lock()
        .map_err(|_| "Failed to lock AI status".to_string())? = None;
    Ok(())
}

#[tauri::command]
pub async fn local_ai_status(app: AppHandle) -> Result<serde_json::Value, String> {
    let endpoint = AI_STATUS
        .lock()
        .map_err(|_| "Failed to lock AI status".to_string())?
        .clone();

    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Failed to resolve app data directory: {error}"))?;

    Ok(serde_json::json!({
        "running": endpoint.is_some(),
        "endpoint": endpoint,
        "modelDirectory": app_data.join("models")
    }))
}
