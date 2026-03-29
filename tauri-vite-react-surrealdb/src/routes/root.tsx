import { Outlet } from "react-router"
import { getCurrentWindow } from "@tauri-apps/api/window"

export const root_loader = async () => {
  const window = getCurrentWindow()
  await window.show()
  await window.setFocus()
}

export function Root() {
  return <Outlet />
}

export default Root
