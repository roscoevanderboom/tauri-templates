mod db;
mod secret;
mod ui;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize database
            db::connection::init_db(app.handle().clone());

            // Setup tray
            ui::tray::setup_tray(app.handle())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Secret commands
            secret::index::save_secret,
            secret::index::get_secret,
            secret::index::delete_secret,
            // DB FS Tree commands
            db::filesystemtree::create_fs_tree,
            db::filesystemtree::update_fs_tree,
            db::filesystemtree::delete_fs_tree,
            db::filesystemtree::get_all_fs_trees,
            db::filesystemtree::get_fs_tree,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
