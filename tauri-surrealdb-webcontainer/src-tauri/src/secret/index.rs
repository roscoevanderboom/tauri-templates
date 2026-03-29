use keyring::Entry;
use tauri::{command, AppHandle};

fn service_name(app: &AppHandle) -> String {
    app.config().identifier.clone()
}

#[command]
pub fn save_secret(app: AppHandle, key: String, value: String) -> Result<(), String> {
    let entry = Entry::new(&service_name(&app), &key).map_err(|e| e.to_string())?;
    entry.set_password(&value).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn get_secret(app: AppHandle, key: String) -> Result<String, String> {
    let entry = Entry::new(&service_name(&app), &key).map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| e.to_string())
}

#[command]
pub fn delete_secret(app: AppHandle, key: String) -> Result<(), String> {
    let entry = Entry::new(&service_name(&app), &key).map_err(|e| e.to_string())?;
    entry.delete_credential().map_err(|e| e.to_string())?;
    Ok(())
}
