use std::sync::OnceLock;
use surrealdb::engine::local::Db;
use surrealdb::engine::local::SurrealKv;
use surrealdb::Surreal;
use tauri::{AppHandle, Manager};

pub static DB: OnceLock<Surreal<Db>> = OnceLock::new();

pub fn init_db(app: AppHandle) {
    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        let app_data_dir = app_handle
            .path()
            .app_data_dir()
            .unwrap_or_else(|_| std::path::PathBuf::from("."));
        let surreal_path = app_data_dir.join("surreal_store");

        log::info!("[SURREALDB] Resolving path: {:?}", surreal_path);

        if let Err(e) = std::fs::create_dir_all(&surreal_path) {
            log::error!("[SURREALDB] Failed to create directory: {}", e);
            return;
        }

        let endpoint = format!("surrealkv://{}", surreal_path.display());
        log::info!("[SURREALDB] Connecting to endpoint: {}", endpoint);

        match Surreal::new::<SurrealKv>(endpoint).await {
            Ok(db) => {
                log::info!("[SURREALDB] Connection established!");
                if let Err(e) = db.use_ns("app").use_db("app").await {
                    log::error!("[SURREALDB] Error selecting namespace/db: {}", e);
                } else {
                    log::info!("[SURREALDB] Ready (ns: app, db: app)");
                    if DB.set(db).is_err() {
                        log::warn!("[SURREALDB] Warning: DB instance already set");
                    }
                }
            }
            Err(e) => {
                log::error!("[SURREALDB] Connection failed: {}", e);
                log::info!("[SURREALDB] Debug Info: Check if path is valid and writable.");
            }
        }
    });
}
