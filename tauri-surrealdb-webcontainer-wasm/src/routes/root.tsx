import { Outlet } from "react-router"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useWebContainerStore } from "@/store/webcontainer-store"
import { waitForConnection } from "@/store/use-db-store"
import Titlebar from "@/components/titlebar"
import Footer from "@/components/footer"

const currentWindow = getCurrentWindow()

export const root_loader = async () => {
  try {
    await waitForConnection()
    await useWebContainerStore.getState().init()
    await currentWindow.show()
    await currentWindow.maximize()
    await currentWindow.setFocus()
  } catch (err) {
    console.warn("[root_loader] Window setup error:", err)
  }
}

function Root() {
  const isInitialized = useWebContainerStore((state) => state.isInitialized)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <Titlebar />
      <div className="relative flex-1 overflow-hidden bg-background">
        {!isInitialized && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="animate-pulse text-sm text-muted-foreground">
                Booting WebContainer environment...
              </p>
            </div>
          </div>
        )}
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default Root
