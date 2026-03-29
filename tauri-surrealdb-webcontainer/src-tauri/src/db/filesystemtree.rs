use crate::db::connection::DB;
use serde::{Deserialize, Serialize};
use surrealdb_types::{RecordId, SurrealValue};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize, SurrealValue)]
pub struct FSMetadata {
    pub id: String,
    pub name: String,
    pub path: String,
    pub node_type: String,
    pub extension: Option<String>,
    pub is_component: Option<bool>,
    pub timestamp: String,
    pub size: Option<usize>,
    pub line_count: Option<usize>,
    pub content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SurrealValue)]
pub struct FSTree {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<RecordId>,
    pub name: String,
    pub loaded: bool,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub tree: Vec<FSMetadata>,
}

impl FSTree {
    pub fn new(name: String) -> Self {
        Self {
            id: None,
            name,
            loaded: true,
            created_at: chrono::Local::now().to_rfc3339(),
            tree: Vec::new(),
        }
    }
}

// ============================================================================
// Tauri Commands
// ============================================================================

#[command]
pub async fn create_fs_tree(name: String) -> Result<FSTree, String> {
    let db = DB.get().ok_or("Database not initialized")?;

    let new_tree = FSTree::new(name);

    let record: Option<FSTree> = db
        .create("filesystemtrees")
        .content(new_tree)
        .await
        .map_err(|e| e.to_string())?;

    record.ok_or_else(|| "Failed to create FS tree".to_string())
}

#[command]
pub async fn update_fs_tree(id: RecordId, tree: Vec<FSMetadata>) -> Result<FSTree, String> {
    let db = DB.get().ok_or("Database not initialized")?;

    let record: Option<FSTree> = db
        .update(id)
        .merge(serde_json::json!({ "tree": tree }))
        .await
        .map_err(|e: surrealdb::Error| e.to_string())?;

    record.ok_or_else(|| "Failed to update FS tree".to_string())
}

#[command]
pub async fn delete_fs_tree(id: RecordId) -> Result<(), String> {
    let db = DB.get().ok_or("Database not initialized")?;

    let _: Option<FSTree> = db
        .delete(id)
        .await
        .map_err(|e: surrealdb::Error| e.to_string())?;

    Ok(())
}

#[command]
pub async fn get_all_fs_trees() -> Result<Vec<FSTree>, String> {
    let db = DB.get().ok_or("Database not initialized")?;

    let trees: Vec<FSTree> = db
        .select("filesystemtrees")
        .await
        .map_err(|e| e.to_string())?;

    Ok(trees)
}

#[command]
pub async fn get_fs_tree(id: RecordId) -> Result<FSTree, String> {
    let db = DB.get().ok_or("Database not initialized")?;

    let tree: Option<FSTree> = db
        .select(id)
        .await
        .map_err(|e: surrealdb::Error| e.to_string())?;

    tree.ok_or_else(|| "FS tree not found".to_string())
}
