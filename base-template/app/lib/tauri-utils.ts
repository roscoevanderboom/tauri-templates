let windowShown = false;

/**
 * Shows the main window and focuses it. 
 * Designed to be called once during app initialization.
 */
export async function showWindow() {
  if (windowShown) return;

  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const window = getCurrentWindow();
    await window.show();
    await window.setFocus();
    windowShown = true;
  } catch (error) {
    console.error("Failed to show window:", error);
  }
}
